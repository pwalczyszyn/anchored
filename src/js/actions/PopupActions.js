import Reflux from 'reflux';

let port;

let PopupActions = Reflux.createActions({

	init: {
		children: ['completed']
	},

	signIn: {},

	backgroundMessage: {
	}

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
	port.postMessage('sign_in_basecamp');
});

export default PopupActions;
