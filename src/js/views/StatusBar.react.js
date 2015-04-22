import React from 'react';
import classNames from 'classnames';

class StatusBar extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
		var classes = classNames('status-bar', {
			info: this.props.type === 'info'
		});
    return (<div className={classes}>{this.props.message}</div>);
  }

}

export default StatusBar;
