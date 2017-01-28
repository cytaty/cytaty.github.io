import React from "react";

export default class SectionMain extends React.Component {
  render() {
    return (
      <main dangerouslySetInnerHTML={{ __html: this.props.text }} />
    );
  }
}

SectionMain.propTypes = {
  text: React.PropTypes.string.isRequired,
};
