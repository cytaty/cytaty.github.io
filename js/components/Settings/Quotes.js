import React from "react";
import Input from "./Input";

import * as QuotesActions from "../../actions/QuotesActions";

export default class Quotes extends React.Component {
  constructor() {
    super();
    this.state = {
      teachers: [],
    };
  }

  componentWillMount() {
    QuotesActions.refreshTeachers();
  }

  render() {
    const props = this.props;

    return (
      <form onSubmit={props.handleSubmit}>
        <div className="form-group">
          <Input setValue={props.setValue} makeValid={props.makeValid} type="textarea" id="text" required />
          <label htmlFor="text">Treść cytatu</label>
          <div className="border" />
        </div>
        <div className="form-group">
          <Input setValue={props.setValue} makeValid={props.makeValid} type="select" id="teacher" />
          <label htmlFor="teacher">Nauczyciel</label>
          <div className="border" />
        </div>
        <div className="form-group">
          <Input setValue={props.setValue} makeValid={props.makeValid} type="textarea" id="info" />
          <label htmlFor="info">Dodatkowe informacje</label>
          <div className="border" />
        </div>
        <div className="form-group">
          <Input setValue={props.setValue} makeValid={props.makeValid} type="input" id="name" />
          <label htmlFor="name">Twoje imię</label>
          <div className="border" />
        </div>

        <button type="submit" className="raised blink-big">Dodaj</button>
      </form>
    );
  }
}
