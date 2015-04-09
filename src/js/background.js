import async from 'async';

function authBasecamp() {
  const CLIENT_ID = '3cbf3c792e29a8d347c014bedc0cbe51aad5ad12';
  const REDIRECT_URL = chrome.identity.getRedirectURL('provider_cb');

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

console.log('oauthData', oauthData);

      if (oauthData.error !== undefined) {
        // that.failed(oauthData);
      } else {
        // that.completed(oauthData);
      }

    }
  );
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.msg === 'authBasecamp') {
    authBasecamp();
  }
});
