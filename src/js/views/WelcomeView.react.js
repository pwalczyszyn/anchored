import React from 'react';

import PopupActions from '../actions/PopupActions';

class WelcomeView extends React.Component {

  onSignInClick () {
    PopupActions.signIn();
  }

  onAuthorClick () {
    chrome.tabs.create({
      url: 'http://outof.me'
    });
  }

  render() {
    return (
      <div className="welcome-view">
        <div className="welcome-view__top-container">
          <span className="icon-anchor welcome-logo"></span>
          <div className="welcome-view__title">Anchored</div>
          <div>
            <a href="http://outof.me"
               onClick={this.onAuthorClick}
               className="welcome-view__author-link"
               tabIndex="-1">by Piotr Walczyszyn</a>
          </div>
        </div>
        <button className="pure-button" onClick={this.onSignInClick}>
          <img src="img/basecamp.png" className="welcome-button__img"/>
          <span className="welcome-button__label">Sign In to Basecamp</span>
        </button>
      </div>
    );
  }

}

export default WelcomeView;
