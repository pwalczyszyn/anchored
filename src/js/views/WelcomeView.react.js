import React from 'react';
import DataActions from '../actions/DataActions';

class WelcomeView extends React.Component {

  onSignInClick () {
    DataActions.signIn();
  }

  render() {
    return (
      <div className="welcome-view">
        <button className="pure-button" onClick={this.onSignInClick}>
          <img src="img/basecamp.png" className="welcome-button__img"/>
          <span className="welcome-button__label">Sign In to Basecamp</span>
        </button>
      </div>
    );
  }

}

export default WelcomeView;
