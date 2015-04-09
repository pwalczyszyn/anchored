import async from 'async';

var DataStore = require('./stores/DataStore');
var DataActions = require('./actions/DataActions');

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.msg === 'authBasecamp') {
		DataActions.signIn();
	}
});

function startSync() {
  console.log('DataStore.getLastSyncTime()', DataStore.getLastSyncTime());
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
				return topic.isNew;
			}).length;

			chrome.browserAction.setBadgeBackgroundColor({
				color: [65, 105, 225, 255]
			});
			chrome.browserAction.setBadgeText({
				text: newCount <= 0 ? '' : (newCount < 1000 ? String(newCount) : '999+')
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
}
