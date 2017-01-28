import React from "react";

export default class SectionMore extends React.Component {
  constructor() {
    super();
    this.toggleMore = this.toggleMore.bind(this);
    this.state = {
      hidden: true,
    };
  }

  toggleMore() {
    this.setState({
      hidden: !this.state.hidden,
    });
  }

  returnDate(stringDate) {
    const strdate = `${stringDate.replace(" ", "T")}+01:00`;
    const date = new Date(strdate);
    const t2d = (a) => {
      return `00${a}`.slice(-2);
    };

    return `${t2d(date.getDate())}.${t2d(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  returnInfo(infoText) {
    return (
      <div className="desc">
        <p className="header">Dodatkowe informacje</p>
        <p>{infoText}</p>
      </div>
    );
  }

  render() {
    const info = (this.props.info !== "") ? this.returnInfo(this.props.info) : null;

    return (
      <div className={(this.state.hidden) ? "hidden" : ""}>
        <nav onClick={this.toggleMore} className="blink-big blink-black">
          <div className="expand-text">POKAŻ WIĘCEJ INFORMACJI</div>
          <div className="expand"><i className="material-icons" /></div>
        </nav>
        <aside>
          <div className="more">
            <div className="time">
              <p className="header">Data dodania</p>
              <p><time>{this.returnDate(this.props.dateAdded)}</time></p>
            </div>
            {info}
          </div>
        </aside>
      </div>
    );
  }
}

SectionMore.propTypes = {
  dateAdded: React.PropTypes.string,
  info: React.PropTypes.string,
};
