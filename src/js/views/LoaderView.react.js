var React = require('react');

var LoaderView = React.createClass({
  render: function () {
    return (
      <div className="loader-view">
        <img src="img/loader.gif" alt="" />
      </div>
    );
  }
});

module.exports = LoaderView;
