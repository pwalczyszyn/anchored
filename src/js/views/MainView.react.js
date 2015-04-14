var React = require('react');
var Reflux = require('reflux');

// var LinksView = require('./LinksView.react');
import LinksView from './LinksView.react';

var LoaderView = require('./LoaderView.react');
var WelcomeView = require('./WelcomeView.react');

var BackgroundStore = require('../stores/BackgroundStore');

var MainView = React.createClass({

  mixins: [Reflux.ListenerMixin],

  getInitialState: function() {
    return {
      signedIn: BackgroundStore.isSignedIn()
    };
  },

  componentDidMount: function() {
    this.listenTo(BackgroundStore, this.onBackgroundStoreChange);
  },

  onBackgroundStoreChange: function (state) {
    switch (state) {
      case 'signin_completed':

        this.setState({
          signedIn: true
        });

        break;
      default:

    }
  },

  render: function () {
    return (
      !this.state.signedIn ? <WelcomeView/> : <LinksView/>
    );
  }
});

module.exports = MainView;
