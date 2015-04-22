import React from 'react/addons';

import classNames from 'classnames';

import PopupStore from '../stores/PopupStore';
import PopupActions from '../actions/PopupActions';

let ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class TopicItemRenderer extends React.Component {

  onTopicClick() {
    PopupActions.openTopic(this.props.topic);
  }

  render() {
    let topic = this.props.topic;
    let listClasses = classNames('topics-list__item', {
      'topics-list__item-seen': !topic.wasSeen
    });
    let linkClasses = classNames('topics-list__link', {
      'topics-list__link--opened': topic.wasOpened
    });
    return (
      <li className={listClasses}>
        <a href={topic.topicable.app_url}
           className={linkClasses}
           onClick={this.onTopicClick.bind(this)}>
          {topic.title}
        </a>
        <div className="topics-list__excerpt">
          {topic.excerpt}
        </div>
      </li>
    )
  }
}

class LinksView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSyncRunning: PopupStore.isSyncRunning()
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.unsubscribe = PopupStore.listen(this.onPopupStoreChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPopupStoreChange(state) {
    this.setState({
      isSyncRunning: PopupStore.isSyncRunning()
    });
  }

  onSyncClick() {
    PopupActions.sync();
  }

  render() {
    let topics = PopupStore.getTopics();

    let viewClasses = classNames('topics-view', {
      'syncing': this.state.isSyncRunning
    });

    let syncBtnClasses = classNames('topics-buttons-bar__button', {
      'syncing': this.state.isSyncRunning
    });

    return (
      <div className={viewClasses}>
        <h4 className="topics-view__title">Latest activity</h4>
        <div className="topics-buttons-bar">
          <button className={syncBtnClasses}
                  onClick={this.onSyncClick}
                  disabled={this.state.isSyncRunning}>
            <span className="icon-refresh"></span>
          </button>
        </div>
        <ReactCSSTransitionGroup transitionName="topics-list"
                                 component="ul"
                                 className="topics-list">
          {
            topics.map(function (topic) {
              return (<TopicItemRenderer key={topic.topicable_id} topic={topic} />);
            })
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }

}

export default LinksView;
