var React = require('react');
var DataActions = require('../actions/DataActions');
var WelcomeView = React.createClass({

  onSignInClick: function () {
    DataActions.signIn();
  },

  render: function() {
    return (
      <div>
        <button onClick={this.onSignInClick}>Sign In</button>
      </div>
    );
  }

});

module.exports = WelcomeView;
