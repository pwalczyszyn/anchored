import React from 'react/addons';
import Reflux from 'reflux';
import moment from 'moment';
import debug from 'debug';

import DataActions from '../actions/DataActions';

let log = debug('DataStore');

var update = React.addons.update;

var DataStore = Reflux.createStore({

	listenables: [DataActions],

	oauthData: null,

	lastSyncTime: null,

	topics: null,

	init: function() {
		this.oauthData = JSON.parse(localStorage.getItem('OAUTH_DATA'));
		this.lastSyncTime = Number(localStorage.getItem('LAST_SYNC_TIME'));
		this.topics = JSON.parse(localStorage.getItem('TOPICS')) || {};
	},

	onSignIn: function() {
		this.trigger('signin_started');
	},

	onSignInCompleted: function(oauthData) {
		this.setOauthData(oauthData);
		this.trigger('signin_completed');
	},

	onSignInFailed: function(oauthData) {
		this.trigger('signin_failed', oauthData.error);
	},

	onSync: function() {
		log('Sync started...');
		this.trigger('sync_started');
	},
	onSyncAuthorized: function(authData) {
		this.oauthData.expires_at = authData.expires_at;
		this.setOauthData(this.oauthData);
		this.trigger('sync_authorized');
	},
	onSyncCompleted: function(newTopics) {
		var newTopicsById = {};

		newTopics.sort(function(a, b) {
			var t1 = moment(a.updated_at);
			var t2 = moment(b.updated_at);
			return t2.valueOf() - t1.valueOf();
		});

		if (newTopics.length > 0) {
			this.lastSyncTime = moment(newTopics[0].updated_at).valueOf();
			localStorage.setItem('LAST_SYNC_TIME', this.lastSyncTime);
		}

		for (var i = newTopics.length - 1, topic; i >= 0; i--) {
			topic = newTopics[i];
			newTopicsById[topic.topicable_id] = topic;
		}

		// Mergin old and new topics
		this.topics = update(this.topics, {
			$merge: newTopicsById
		});

		this.storeTopics();

		this.trigger('sync_completed');

		debug('Sync completed!');
	},

	onSyncFailed: function(err) {
		this.trigger('sync_failed', err.message);
	},

	onMarkAsSeen: function() {

		// Setting existing topics as seen
		for (var topicableId in this.topics) {
			this.topics[topicableId].wasSeen = true;
		}

		this.storeTopics();

		this.trigger('marked_as_seen');
	},

	storeTopics: function() {
		// Storing topics
		localStorage.setItem('TOPICS', JSON.stringify(this.topics));
	},
	setOauthData: function(oauthData) {
		this.oauthData = oauthData;
		localStorage.setItem('OAUTH_DATA', JSON.stringify(oauthData));
	},

	getOauthData: function() {
		return this.oauthData;
	},

	isSignedIn: function() {
		return this.oauthData !== null && !moment(this.oauthData.expires_at).isBefore();
	},

	getLastSyncTime: function() {
		return new Date(this.lastSyncTime);
	},

	getTopics: function() {
		var topics = [];

		for (var topicableId in this.topics) {
			topics.push(this.topics[topicableId]);
		}

		topics.sort(function(a, b) {
			var t1 = moment(a.updated_at);
			var t2 = moment(b.updated_at);
			return t2.valueOf() - t1.valueOf();
		});

		return topics;
	}

});

module.exports = DataStore;
