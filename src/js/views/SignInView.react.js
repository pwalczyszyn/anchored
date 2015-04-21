import React from 'react';

import PopupActions from '../actions/PopupActions';

class SignInView extends React.Component {

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
      <div className="signin-view">
        <div className="signin-view__top-container">
          <span className="icon-anchor signin-logo"></span>
          <div className="signin-view__title">Anchored</div>
          <div>
            <a href="http://outof.me"
               onClick={this.onAuthorClick}
               className="signin-view__author-link"
               tabIndex="-1">by Piotr Walczyszyn</a>
          </div>
        </div>
        <button className="pure-button" onClick={this.onSignInClick}>
          <img src="img/basecamp.png" className="signin-button__img"/>
          <span className="signin-button__label">Sign In to Basecamp</span>
        </button>
      </div>
    );
  }

}

export default SignInView;
