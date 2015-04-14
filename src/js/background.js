import async from 'async';
import debug from 'debug';

// Enabling debug
debug.enable('*');

let log = debug('background');

let BackgroundStore = require('./stores/BackgroundStore');
let BackgroundActions = require('./actions/BackgroundActions');

var port;
var timer;
var isFirstSync = false;
var isPopupOpened = false;
var isSyncRunning = false;

function popupClosed() {
	// Flagging that popup is closed
	port = null;

	// Clearing icon badge
	chrome.browserAction.setBadgeText({
		text: ''
	});

	// Marking all topics as seen
	BackgroundActions.markAsSeen();
}

function popupMessage(msg) {
	if (msg.action === 'authBasecamp') {

		BackgroundActions.signIn();

	}
}

chrome.runtime.onConnect.addListener(function(_port) {

	if (_port.name === 'popup_opened') {

		// Setting ref to port object
		port = _port;

		// Listen when popup is closed
		port.onDisconnect.addListener(popupClosed);

		// Listen to popup messages
		port.onMessage.addListener(popupMessage);

		// Sending message to popup with current sync status
		port.postMessage({
			isFirstSync: isFirstSync,
			isSyncRunning: isSyncRunning
		});

	}

});

function startSync(_isFirstSync) {
	if (!isSyncRunning) {
		isFirstSync = _isFirstSync || false;
		isSyncRunning = true;
		BackgroundActions.sync(
			BackgroundStore.getLastSyncTime(),
			BackgroundStore.getOauthData()
		);

		if (port) {
			port.postMessage({
				isFirstSync: isFirstSync,
				isSyncRunning: isSyncRunning
			});
		}

	}
}



BackgroundStore.listen(function(status, errorMessage) {
	log('BackgroundStore status', status);

	switch (status) {
		case 'signin_completed':

			// Starting sync
			startSync(true);

			break;
		case 'signin_failed':

			break;
		case 'sync_authorized':

			chrome.browserAction.setBadgeBackgroundColor({
				color: [0, 255, 0, 255]
			});
			chrome.browserAction.setBadgeText({
				text: 'sync'
			});

			break;
		case 'sync_completed':

			var topics = BackgroundStore.getTopics();
			var newCount = topics.filter(function(topic) {
				return !topic.wasSeen;
			}).length;

			chrome.browserAction.setBadgeBackgroundColor({
				color: [65, 105, 225, 255]
			});
			chrome.browserAction.setBadgeText({
				text: newCount <= 0 ? '' : (newCount < 1000 ? String(newCount) :
					'999+')
			});

			break;
		case 'sync_failed':

			chrome.browserAction.setBadgeText({
				text: ''
			});

			break;
		default:

	}
});

if (BackgroundStore.isSignedIn()) {

	// Starting sync
	startSync(false);

	// Startic sync timer
	timer = setTimeout(function() {
		startSync();
	}, 10 * 60 * 1000);

}
