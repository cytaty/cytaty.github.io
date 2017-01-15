import React from "react";

import DialogStore from "../stores/DialogStore";
import * as DialogActions from "../actions/DialogActions";

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
    DialogStore.on("dialogChange", this.changeVisibility);
  }

  componentWillUnmount() {
    DialogStore.removeListener("dialogChange", this.changeVisibility);
  }

  changeVisibility() {
    const data = DialogStore.getProps();
    this.setState({
      text: data.text,
      visible: data.visible,
    });
  }

  dontShowAgain() {
    const date = new Date();
    date.setDate(date.getDate() + 3650);

    document.cookie = `mainPage=true; expires=${date}`;

    DialogActions.hide();
  }

  createMarkup() {
    return { __html: this.state.text };
  }

  render() {
    return (
      <div className={`dialog${(this.state.visible) ? " visible" : ""}`}>
        <div className="dialog-box">
          <div className="dialog-main">
            <h2>Ekran początkowy</h2>
            <p id="dialog-msg" dangerouslySetInnerHTML={this.createMarkup()} />
          </div>
          <div className="dialog-btns">
            <button onClick={this.dontShowAgain} className="flat" id="dialog-close">Nie pokazuj więcej</button>
            <button onClick={DialogActions.hide} className="flat" id="dialog-close">Ok</button>
          </div>
        </div>
      </div>
    );
  }
}
