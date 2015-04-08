import React from 'react';

import DataStore from '../stores/DataStore';
import DataActions from '../actions/DataActions';

class TopicItemRenderer extends React.Component {
  render() {
    let topic = this.props.topic;
    return (
      <li>
        <a href={topic.topicable.app_url}>{topic.title}</a>
        <div className="topic-excerpt">{topic.excerpt}</div>
      </li>
    )
  }
}

class LinksView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      topics: DataStore.getTopics()
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    DataActions.sync(
      DataStore.getLastSyncTime(),
      DataStore.getOauthData()
    );
    this.unsubscribe = DataStore.listen(this.onDataStoreChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onDataStoreChange(state) {

    switch (state) {
      case 'sync_completed':

        this.setState({
          topics: DataStore.getTopics()
        });

        break;
      default:
    }

  }

  render() {
    let topics = this.state.topics;
    return (
      <div className="links-view">
        <h4>Latest activity</h4>
        <ul className="links-list">
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
