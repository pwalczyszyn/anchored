import async from 'async';

let DataStore = require('./stores/DataStore');
let DataActions = require('./actions/DataActions');

var isPopupOpened = false;

chrome.runtime.onConnect.addListener(function(port) {

  if (port.name === 'popup_opened') {

    isPopupOpened = true;

    port.onDisconnect.addListener(function() {
      chrome.browserAction.setBadgeText({
        text: ''
      });
      isPopupOpened = false;
    });

		port.onMessage.addListener(function(msg) {
			if (msg.action === 'authBasecamp') {
		    DataActions.signIn();
		  }
		});

  }

});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
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
}
