(function() {

	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {

			console.log('xxx ' + request.msg);

      var CLIENT_ID = '3cbf3c792e29a8d347c014bedc0cbe51aad5ad12';
      var REDIRECT_URL = chrome.identity.getRedirectURL('provider_cb');

      chrome.identity.launchWebAuthFlow({
          url: 'https://launchpad.37signals.com/authorization/new?type=user_agent&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URL,
          interactive: true
        },
        function(redirectUrl) {
          console.log(redirectUrl);
        }
      );


		});

})();
