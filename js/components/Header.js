import React from "react";
import * as QuotesActions from "../actions/QuotesActions";

export default class Header extends React.Component {
  refreshQuotes() {
    QuotesActions.refreshQuotes();
  }

  render() {
    return (
      <header className="app-bar fixed">
        <div className="status-bar" />
        <nav>
          <div className="title left"><span>Cytaty Nauczycieli</span></div>
          <div className="icons right">
            <button onClick={this.refreshQuotes.bind(this)} className="search blink"><i className="material-icons">refresh</i></button>
            {/* <button className="more blink"><i className="material-icons">more_vert</i></button> */}
            {/* <button className="search blink"><i className="material-icons">filter_list</i></button> */}
          </div>
        </nav>
      </header>
    );
  }
}
