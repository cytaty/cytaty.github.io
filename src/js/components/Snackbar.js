import React from "react";

import SnackbarStore from "../stores/SnackbarStore";
import * as SnackbarActions from "../actions/SnackbarActions";

export default class Snackbar extends React.Component {
  constructor() {
    super();
    this.changeVisibility = this.changeVisibility.bind(this);
    this.state = {
      text: "",
      visible: false,
    };
  }

  componentWillMount() {
    SnackbarStore.on("snackbarChange", this.changeVisibility);
  }

  componentWillUnmount() {
    SnackbarStore.removeListener("snackbarChange", this.changeVisibility);
  }

  changeVisibility() {
    const data = SnackbarStore.getProps();
    this.setState({
      text: data.text,
      visible: data.visible,
    });
  }

  render() {
    return (
      <div onClick={SnackbarActions.hide} className={`snackbar${(this.state.visible) ? " visible" : ""}`}>
        { this.state.text }
      </div>
    );
  }
}
