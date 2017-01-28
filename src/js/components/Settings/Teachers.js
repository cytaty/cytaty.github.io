import React from "react";
import Input from "./Input";

export default class Quotes extends React.Component {
  render() {
    const props = this.props;

    return (
      <form onSubmit={props.handleSubmit}>
        <div className="form-group">
          <Input setValue={props.setValue} makeValid={props.makeValid} type="input" id="name" required />
          <label htmlFor="name">Imię i nazwisko nauczyciela</label>
          <div className="border" />
        </div>

        <button type="submit" className="raised blink-big">Dodaj</button>
      </form>
    );
  }
}
