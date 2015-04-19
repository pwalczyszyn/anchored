import React from 'react';

import classNames from 'classnames';

import PopupStore from '../stores/PopupStore';
import PopupActions from '../actions/PopupActions';

class TopicItemRenderer extends React.Component {

  onTopicClick() {
    chrome.tabs.create({
      url: this.props.topic.topicable.app_url
    });
    this.props.topic.wasOpened = true;
  }

  render() {
    let topic = this.props.topic;
    return (
      <li className={classNames('topics-list__item', {'topics-list__item-seen': !topic.wasSeen})}>
        <a href={topic.topicable.app_url}
           className="topics-list__link"
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
      topics: PopupStore.getTopics()
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    // this.unsubscribe = PopupStore.listen(this.onPopupStoreChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPopupStoreChange(state) {

    switch (state) {
      case 'sync_completed':

        this.setState({
          topics: PopupStore.getTopics()
        });

        break;
      default:
    }

  }

  render() {
    let topics = this.state.topics;
    return (
      <div className="topics-view">
        <h4>Latest activity</h4>
        <ul className="topics-list">
          {
            topics.map(function (topic) {
              return (<TopicItemRenderer key={topic.topicable_id} topic={topic} />);
            })
          }
        </ul>
      </div>
    );
  }
}

export default LinksView;
