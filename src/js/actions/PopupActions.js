import Reflux from 'reflux';

let port;

let PopupActions = Reflux.createActions({

  init: {
    children: ['completed']
  },

  signIn: {},

  backgroundMessage: {},

  sync: {},

  openTopic: {}

});

PopupActions.init.listen(function() {
  let that = this;
  port = chrome.runtime.connect({
    name: 'popup_opened'
  });
  port.onMessage.addListener(function(message) {
    if (typeof message === 'object' && message.state === 'connected') {
      that.completed(message);
    } else {
      PopupActions.backgroundMessage(message);
    }
  });
});

PopupActions.signIn.listen(function() {
  port.postMessage({
    name: 'sign_in_basecamp'
  });
});

PopupActions.sync.listen(function() {
  port.postMessage({
    name: 'sync'
  });
});

PopupActions.openTopic.listen(function(topic) {
  port.postMessage({
    name: 'topic_opened',
    topicId: topic.topicable_id
  });
  chrome.tabs.create({
    url: topic.topicable.app_url
  });

});


export default PopupActions;
