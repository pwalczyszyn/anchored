var React = require('react');
var Reflux = require('reflux');

// var LinksView = require('./LinksView.react');
import LinksView from './LinksView.react';

var LoaderView = require('./LoaderView.react');
var WelcomeView = require('./WelcomeView.react');

var DataStore = require('../stores/DataStore');
var DataActions = require('../actions/DataActions');

var MainView = React.createClass({

  mixins: [Reflux.ListenerMixin],

  getInitialState: function() {

    return {
      signedIn: DataStore.isSignedIn()
    };
  },

  componentDidMount: function() {
    this.listenTo(DataStore, this.onDataStoreChange);
  },

  onDataStoreChange: function (state) {
    switch (state) {
      case 'signedIn':

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
