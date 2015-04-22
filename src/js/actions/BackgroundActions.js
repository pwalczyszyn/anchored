import Reflux from 'reflux';
import request from 'superagent';
import moment from 'moment';
import async from 'async';

const CLIENT_ID = '3cbf3c792e29a8d347c014bedc0cbe51aad5ad12';
const REDIRECT_URL = chrome.identity.getRedirectURL('provider_cb');

const BackgroundActions = Reflux.createActions({
	signIn: {
		asyncResult: true
	},
	sync: {
		asyncResult: true,
		children: ['authorized']
	},
	markAsSeen: {},
	markOpened: {}
});

BackgroundActions.signIn.listen(function() {
	var that = this;

	chrome.identity.launchWebAuthFlow({
			url: 'https://launchpad.37signals.com/authorization/new?type=user_agent&client_id=' +
				CLIENT_ID + '&redirect_uri=' + REDIRECT_URL,
			interactive: true
		},
		function(redirectUrl) {
			var oauthData = {};
			var splits = redirectUrl.split(/#|&/gi);
			splits.forEach(function(s) {
				if (s.indexOf('=') !== -1) {
					var param = s.split('=');
					oauthData[param[0]] = decodeURIComponent(param[1]);
				}
			});

			if (oauthData.error !== undefined) {
				that.failed(oauthData);
			} else {
				that.completed(oauthData);
			}

		}
	);

});

function authorize(oauthData, callback) {
	var that = this;

	async.waterfall([

		function auth(callback) {
			request
				.get('https://launchpad.37signals.com/authorization.json')
				.set('Authorization', 'Bearer ' + oauthData.access_token)
				.set('Accept', 'application/json')
				.end(function(err, res) {
					callback(err, res ? res.body : null);
				});
		},

		function user(authData, callback) {
			var accountUsers = [];
			var accounts = authData.accounts || [];

			async.each(accounts, function(account, cb) {

				// Checking if this is a basecamp account
				if (account.product !== 'bcx') {
					return cb();
				}

				request
					.get(account.href + '/people/me.json')
					.set('Authorization', 'Bearer ' + oauthData.access_token)
					.set('Accept', 'application/json')
					.end(function(err, result) {
						if (!err) {
							accountUsers.push({
								account: account,
								user: result.body
							});
						}

						return cb();
					});

			}, function() {
				callback(null, authData, accountUsers);
			});

		}

	], function(err, authData, accountUsers) {

		if (err) {
			callback(err);
		} else {
			callback(null, authData, accountUsers);
		}

	});
}

function loadLatest(since, userAccounts, oauthData, callback) {

	var that = this;
	var userTopics = [];

	function createTopic(topic, reason) {
		return {
			id: 'basecamp-' + topic.bucket.id + '-' + topic.id,
			topicable_id: 'basecamp-' + topic.bucket.id + '-' + topic.topicable.id,
			project_name: topic.bucket.name,
			reason: reason,
			title: topic.title,
			excerpt: topic.excerpt,
			creator: topic.last_updater,
			created_at: topic.created_at,
			updated_at: topic.updated_at,
			topicable: topic.topicable,
			source: 'basecamp',
			wasSeen: false
		};
	}

	var deepCheckQueue = async.queue(function(data, callback) {
		var user = data.user;
		var topic = data.topic;

		request
			.get(topic.topicable.url)
			.set('Authorization', 'Bearer ' + oauthData.access_token)
			.set('Accept', 'application/json')
			.end(function(err, res) {
				if (err) {
					console.log('error getting topicable for topic', topic);
					return callback();
				}

				var topicable = res.body;

				// If current user is a creator of topicable object
				var isCreator = topicable.creator && topicable.creator.id === user.id;

				if (isCreator) {

					userTopics.push(createTopic(topic, 'topicable_creator'));

				} else {

					var isUploader = topicable.attachments && topicable.attachments.some(
						function(attachment) {
							return attachment.creator.id === user.id;
						}
					);

					if (isUploader) {

						userTopics.push(createTopic(topic, 'topicable_uploader'));

					} else {

						var isSubscriber = topicable.subscribers && topicable.subscribers.some(
							function(subscriber) {
								return subscriber.id === user.id;
							});

						if (isSubscriber) {

							userTopics.push(createTopic(topic, 'topicable_subscriber'));

						} else {

							var isCommenter = topicable.comments && topicable.comments.some(
								function(comment) {
									return comment.creator.id === user.id;
								});

							if (isCommenter) {

								userTopics.push(createTopic(topic, 'topicable_commenter'));

							}
						}
					}
				}

				callback();

			});

	}, 5);

	async.each(userAccounts, function topicsQuery(userAccount, callback) {

		var user = userAccount.user;
		var account = userAccount.account;

		function getTopics(page) {
			request
				.get(account.href + '/topics.json')
				.query({
					page: page
				})
				.set('Authorization', 'Bearer ' + oauthData.access_token)
				.set('Accept', 'application/json')
				.end(function(err, res) {
					if (err) {
						return callback(err);
					}

					var topics = res.body;
					var checkNextPage = true;

					if (!topics || topics.length === 0) {
						callback();
						return;
					}

					for (var i = 0, topic, updatedAt; i < topics.length; i++) {
						topic = topics[i];
						updatedAt = moment(topic.updated_at);

						if (!updatedAt.isAfter(since)) {
							checkNextPage = false;
							break;
						}

						if (topic.last_updater && user.id === topic.last_updater.id) {

							userTopics.push(createTopic(topic, 'topic_creator'));

						} else {

							deepCheckQueue.push({
								topic: topic,
								user: user
							});

						}

					}

					if (checkNextPage) {
						getTopics(page + 1);
					} else {
						callback();
					}
				});

		}

		getTopics(1);

	}, function(err) {

		if (err) {
			return callback(err, userTopics);
		}

		// Checking if queue is empty
		if (deepCheckQueue.length() > 0) {

			deepCheckQueue.drain = function() {
				callback(null, userTopics);
			};

		} else {

			callback(null, userTopics);

		}

	});
}

BackgroundActions.sync.listen(function(since, oauthData) {
	var that = this;

	async.waterfall([
		function(callback) {

			authorize(oauthData, function(err, authData, userAccounts) {

				if (err) {
					return callback(err);
				}

				// Notifying that user was authorized
				that.authorized(authData);

				callback(null, userAccounts);
			});


		},

		function(userAccounts, callback) {

			loadLatest(since, userAccounts, oauthData, function(err, topics) {
				if (err) {
					return callback(err);
				}

				callback(null, topics);
			});

		}
	], function(err, topics) {

		if (err) {
			return that.failed(err);
		}

		that.completed(topics);

	});

});


export default BackgroundActions;
