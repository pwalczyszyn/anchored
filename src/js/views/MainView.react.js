import React from 'react';
import Reflux from 'reflux';

import TopicsView from './TopicsView.react';
import SignInView from './SignInView.react';
import StatusBar from './StatusBar.react';

import PopupStore from '../stores/PopupStore';
import PopupActions from '../actions/PopupActions';

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
    return (
      <div>

        {!this.state.signedIn ? <SignInView/> : <TopicsView/>}

        <StatusBar/>
      </div>
    );
  }

}

export default MainView;
