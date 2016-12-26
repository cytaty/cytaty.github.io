import React from "react";

import SnackbarStore from "../stores/SnackbarStore";
import * as SettingsActions from "../actions/SettingsActions";

export default class FloatingAB extends React.Component {
  constructor() {
    super();
    this.changeSnackbar = this.changeSnackbar.bind(this);
    this.state = {
      snackbar: false,
    };
  }
  componentWillMount() {
    SnackbarStore.on("snackbarChange", this.changeSnackbar);
  }

  componentWillUnmount() {
    SnackbarStore.removeListener("snackbarChange", this.changeSnackbar);
  }

  changeSnackbar() {
    const data = SnackbarStore.getProps();
    this.setState({
      snackbar: data.visible,
    });
  }

  showTab(a) {
    SettingsActions.showSettings(a);
  }

  render() {
    return (
      <div className={`fab-main${(this.state.snackbar) ? " fab-snackbar" : ""}`}>
        <i className="material-icons">add</i>
        <i className="material-icons">close</i>
        <div className="submenu">
          <button onClick={this.showTab.bind(this, "teachers")} className="fab-mini"><span><i className="material-icons">person</i></span></button>
          <button onClick={this.showTab.bind(this, "quotes")} className="fab-mini"><span><i className="material-icons">format_quote</i></span></button>
        </div>
      </div>
    );
  }
}
