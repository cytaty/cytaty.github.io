import React from "react";

import Quotes from "./Quotes";
import Teachers from "./Teachers";

import * as QuotesActions from "../../actions/QuotesActions";
import * as SettingsActions from "../../actions/SettingsActions";

import SettingsStore from "../../stores/SettingsStore";

export default class Main extends React.Component {
  constructor() {
    super();
    this.setValue = this.setValue.bind(this);
    this.makeValid = this.makeValid.bind(this);
    this.handleQuotesSubmit = this.handleQuotesSubmit.bind(this);
    this.handleTeachersSubmit = this.handleTeachersSubmit.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.state = {
      valid: [],
      values: [],
    };
  }

  componentWillMount() {
    SettingsStore.on("settingsChange", this.changeTab);
  }

  componentWillUnmount() {
    SettingsStore.removeListener("settingsChange", this.changeTab);
  }

  setValue(id, text) {
    const values = this.state.values;
    values[id] = text;
    this.setState({ values });
  }

  changeTab() {
    this.setState({
      valid: [],
      values: [],
    });
  }

  makeValid(id, isValid) {
    const valid = this.state.valid;
    valid[id] = isValid;
    this.setState({ valid });
  }

  isValid(e) {
    e.preventDefault();
    let allValid;
    allValid = true;

    const valid = this.state.valid;

    /* eslint-disable no-restricted-syntax */
    for (const val in valid) {
      if ({}.hasOwnProperty.call(valid, val)) {
        if ( valid[val] === false ) {
          allValid = false;
        }
      }
    }
    /* eslint-enable no-restricted-syntax */

    return allValid;
  }

  handleQuotesSubmit(e) {
    const allValid = this.isValid(e);
    if ( allValid ) {
      QuotesActions.createQuote(this.state.values);
      SettingsActions.showSettings(null);
      this.setState({ valid: [], values: [] });
    } else {
      console.log( this.state.valid, allValid );
    }
  }

  handleTeachersSubmit(e) {
    const allValid = this.isValid(e);
    if ( allValid ) {
      console.log( this.state.values );
      QuotesActions.createTeacher(this.state.values);
      SettingsActions.showSettings(null);
      this.setState({ valid: [], values: [] });
    } else {
      console.log( this.state.valid, allValid );
    }
  }

  render() {
    switch (SettingsStore.getTab()) {
      case "quotes":
        return (
          <Quotes handleSubmit={this.handleQuotesSubmit} setValue={this.setValue} makeValid={this.makeValid} />
        );
      case "teachers":
        return (
          <Teachers handleSubmit={this.handleTeachersSubmit} setValue={this.setValue} makeValid={this.makeValid} />
        );
      default:
        return null;
    }
  }
}
