import React from "react";
import SectionMain from "./Section/Main";
import SectionFooter from "./Section/Footer";
import SectionMore from "./Section/More";

export default class Section extends React.Component {
  render() {
    return (
      <section>
        <blockquote>
          <SectionMain text={this.props.quote.text} />
          <SectionFooter teacher={this.props.quote.teacher} />
          <SectionMore dateAdded={this.props.quote.dateAdded} info={this.props.quote.info} />
        </blockquote>
      </section>
    );
  }
}

Section.propTypes = {
  quote: React.PropTypes.object.isRequired,
};
