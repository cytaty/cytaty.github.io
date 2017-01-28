import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

class SnackbarStore extends EventEmitter {
  constructor() {
    super();
    this.hideSnackbar = this.hideSnackbar.bind(this);
    this.visible = false;
    this.text = "";
    this.timeout = null;
  }

  showSnackbar(text) {
    this.visible = true;
    this.text = text;
    this.timeout = setTimeout(this.hideSnackbar, 3000);
    this.emit("snackbarChange");
  }

  hideSnackbar() {
    clearTimeout(this.timeout);
    this.visible = false;
    this.emit("snackbarChange");
  }

  getProps() {
    return { visible: this.visible, text: this.text };
  }

  /* eslint-disable default-case */
  handleActions(action) {
    switch (action.type) {
      case "SHOW_SNACK":
        this.showSnackbar(action.text);
        break;
      case "HIDE_SNACK":
        this.hideSnackbar();
        break;
    }
  }
  /* eslint-enable default-case */
}

const snackbarStore = new SnackbarStore();
dispatcher.register(snackbarStore.handleActions.bind(snackbarStore));

export default snackbarStore;
