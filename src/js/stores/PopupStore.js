import Reflux from 'reflux';
import moment from 'moment';
import debug from 'debug';

import PopupActions from '../actions/PopupActions';

let log = debug('PopupStore');

let PopupStore = Reflux.createStore({

	port: null,

	topics: null,

	lastError: null,

	firstSyncCompleted: null,

	signedIn: false,

	syncRunning: false,

	init: function() {

		this.loadData();

		this.listenTo(PopupActions.backgroundMessage, this.onBackgroundMessage);
		this.listenTo(PopupActions.init.completed, this.onInitCompleted);

	},

	loadData: function () {
		this.oauthData = JSON.parse(localStorage.getItem('OAUTH_DATA'));
		this.topics = JSON.parse(localStorage.getItem('TOPICS')) || {};
		this.lastError = JSON.parse(localStorage.getItem('LAST_ERROR'));
		this.firstSyncCompleted = JSON.parse(
			localStorage.getItem('FIRST_SYNC_COMPLETED')
		) || false;
	},

	onInitCompleted: function(message) {
		this.syncRunning = message.isSyncRunning;
		this.trigger();
	},

	onBackgroundMessage: function(message) {
		log('Received message from bg script:', message);

		// Load data from localStorage
		this.loadData();

		switch (message) {
			case 'sync_started':
				this.syncRunning = true;
				break;
			case 'sync_completed':
			case 'sync_failed':
				this.syncRunning = false;
				break;
			default:
		}

		this.trigger();
	},

	getLastError: function() {
		return this.lastError;
	},

	isFirstSyncCompleted: function() {
		return this.firstSyncCompleted;
	},

	isSyncRunning: function() {
		return this.syncRunning;
	},

	isSignedIn: function() {
		return this.oauthData !== null && !moment(this.oauthData.expires_at).isBefore();
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

export default PopupStore;
