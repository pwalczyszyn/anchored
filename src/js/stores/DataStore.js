import React from 'react/addons';
import Reflux from 'reflux';
import moment from 'moment';
import debug from 'debug';

import DataActions from '../actions/DataActions';

let log = debug('DataStore');

let update = React.addons.update;

let DataStore = Reflux.createStore({

	listenables: [DataActions],

	oauthData: null,

	lastSyncTime: null,

	topics: null,

	firstSync: true,

	lastError: null,

	firstSyncCompleted: false,

	init: function() {
		this.oauthData = JSON.parse(localStorage.getItem('OAUTH_DATA'));
		this.lastSyncTime = Number(localStorage.getItem('LAST_SYNC_TIME'));
		this.topics = JSON.parse(localStorage.getItem('TOPICS')) || {};
		this.lastError = JSON.parse(localStorage.getItem('LAST_ERROR'));
		this.firstSyncCompleted = JSON.parse(
			localStorage.getItem('FIRST_SYNC_COMPLETED')
		) || false;
	},

	onSignIn: function() {
		log('sign in started');
		this.trigger('signin_started');
	},

	onSignInCompleted: function(oauthData) {
		log('sign in completed');
		this.setOauthData(oauthData);
		this.trigger('signin_completed');
	},

	onSignInFailed: function(oauthData) {
		this.setLastError('Sign in failed, with error: ' + oauthData.error);
		this.trigger('signin_failed', oauthData.error);
	},

	onSync: function() {
		log('sync started');
		this.trigger('sync_started');
	},

	onSyncAuthorized: function(authData) {
		log('sync authorized');
		this.oauthData.expires_at = authData.expires_at;
		this.setOauthData(this.oauthData);
		this.trigger('sync_authorized');
	},

	onSyncCompleted: function(newTopics) {
		log('sync completed');
		let newTopicsById = {};

		newTopics.sort(function(a, b) {
			let t1 = moment(a.updated_at);
			let t2 = moment(b.updated_at);
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

		// Storing new topics
		this.storeTopics();

		// Setting flag that initial sync completed
		if (!this.firstSyncCompleted) {
			this.firstSyncCompleted = true;
			localStorage.setItem('FIRST_SYNC_COMPLETED', this.firstSyncCompleted);
		}

		// Setting that there was no error
		this.setLastError(null);

		// Notifying about sync completion
		this.trigger('sync_completed');
	},

	onSyncFailed: function(err) {
		this.setLastError('Sync failed, with error: ' + err.message);
		this.trigger('sync_failed');
	},

	onMarkAsSeen: function() {
		// Setting existing topics as seen
		for (var topicableId in this.topics) {
			this.topics[topicableId].wasSeen = true;
		}

		// Storing updated topics
		this.storeTopics();

		// Notifying
		this.trigger('marked_as_seen');
	},

	setLastError: function(message) {
		if (message) {
			log(message);
			this.lastError = {
				message: message,
				time: Date.now()
			};
		} else {
			this.lastError = null;
		}
		localStorage.setItem('LAST_ERROR', JSON.stringify(this.lastError));
	},

	getLastError: function() {
		return this.lastError;
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

	isFirstSyncCompleted: function() {
		return this.firstSyncCompleted;
	},

	isSignedIn: function() {
		return this.oauthData !== null && !moment(this.oauthData.expires_at).isBefore();
	},

	getLastSyncTime: function() {
		return new Date(this.lastSyncTime);
	},

	getTopics: function() {
		let topics = [];

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

export default DataStore;
