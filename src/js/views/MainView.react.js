import React from 'react/addons';
import Reflux from 'reflux';

import TopicsView from './TopicsView.react';
import SignInView from './SignInView.react';
import StatusBar from './StatusBar.react';

import PopupStore from '../stores/PopupStore';
import PopupActions from '../actions/PopupActions';

let ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class MainView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      signedIn: PopupStore.isSignedIn()
    };
  }

  componentDidMount() {
    PopupActions.init();
    this.unsubscribe = PopupStore.listen(this.onPopupStoreChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPopupStoreChange() {
    this.setState({
      signedIn: PopupStore.isSignedIn(),
      isFirstSyncCompleted: PopupStore.isFirstSyncCompleted(),
      isSyncRunning: PopupStore.isSyncRunning()
    });
  }

  render() {
    var statusBarProps = {
      type: 'info',
      message: (!this.state.isFirstSyncCompleted ? 'First sync, please be patient ;)' :
        (this.state.isSyncRunning ? 'Synchronizaing topics...' : null))
    };
    return (
      <div>
        {!this.state.signedIn ? <SignInView/> : <TopicsView/>}
        <ReactCSSTransitionGroup transitionName="status-bar">
          {this.state.isSyncRunning ? <StatusBar {...statusBarProps}/> : null}
        </ReactCSSTransitionGroup>
      </div>
    );
  }

}

export default MainView;
