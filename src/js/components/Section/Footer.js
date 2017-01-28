import React from "react";

export default class SectionFooter extends React.Component {
  render() {
    return (
      <footer>
        {this.props.teacher}
      </footer>
    );
  }
}

SectionFooter.propTypes = {
  teacher: React.PropTypes.string.isRequired,
};
