var React = require('react');
var Reflux = require('reflux');

// var LinksView = require('./LinksView.react');
import LinksView from './LinksView.react';

var LoaderView = require('./LoaderView.react');
var WelcomeView = require('./WelcomeView.react');

var PopupStore = require('../stores/PopupStore');
var PopupActions = require('../actions/PopupActions');

var MainView = React.createClass({

  mixins: [Reflux.ListenerMixin],

  getInitialState: function() {
    return {
      signedIn: PopupStore.isSignedIn()
    };
  },

  componentDidMount: function() {
    PopupActions.init();
    this.listenTo(PopupStore, this.onStoreUpdates);
  },

  onStoreUpdates: function() {
    this.setState({
      signedIn: PopupStore.isSignedIn(),
      isFirstSyncCompleted: PopupStore.isFirstSyncCompleted(),
      isSyncRunning: PopupStore.isSyncRunning()
    });
  },

  render: function () {
    return (
      !this.state.signedIn ? <WelcomeView/> : <LinksView/>
    );
  }
});

module.exports = MainView;
