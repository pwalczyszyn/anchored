import async from 'async';

let DataStore = require('./stores/DataStore');
let DataActions = require('./actions/DataActions');

var isPopupOpened = false;
var isSyncRunning = false;
var timer;

chrome.runtime.onConnect.addListener(function(port) {

	if (port.name === 'popup_opened') {

		isPopupOpened = true;

		port.onDisconnect.addListener(function() {

			// Flagging that popup is closed
			isPopupOpened = false;

			// Clearing icon badge
			chrome.browserAction.setBadgeText({
				text: ''
			});

			// Marking all topics as seen
			DataActions.markAsSeen();

		});

		port.onMessage.addListener(function(msg) {
			if (msg.action === 'authBasecamp') {

				DataActions.signIn();

			}
		});

	}

});

function startSync() {
  isSyncRunning = true;
	DataActions.sync(
		DataStore.getLastSyncTime(),
		DataStore.getOauthData()
	);
}

DataStore.listen(function(status) {
	console.log('DataStore status', status);

	switch (status) {
		case 'signedIn':

			startSync();

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

			var topics = DataStore.getTopics();
			var newCount = topics.filter(function(topic) {
				return topic.wasSeen;
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

if (DataStore.isSignedIn()) {
	startSync();

  timer = setTimeout(function () {
    startSync();
  }, 10 * 60 * 1000);

}
