let port = chrome.runtime.connect({
  name: 'popup_opened'
});

export default port;
