import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

class SettingsStore extends EventEmitter {
  constructor() {
    super();
    this.settings = false;
    this.tab = null;
  }

  toggleSettings(a) {
    if ( a !== null ) {
      this.tab = a;
    }
    this.settings = !this.settings;
    this.emit("settingsChange");
  }

  changeTab(a) {
    this.tab = a;
    this.emit("settingsChange");
  }

  getTab() {
    return this.tab;
  }

  getSettingsVisible() {
    return this.settings;
  }

  /* eslint-disable default-case */
  handleActions(action) {
    switch (action.type) {
      case "SHOW_SETTINGS":
        this.toggleSettings(action.tab);
        break;
      case "CHANGE_TAB":
        this.changeTab(action.tab);
        break;
    }
  }
  /* eslint-enable default-case */
}

const settingsStore = new SettingsStore();
dispatcher.register(settingsStore.handleActions.bind(settingsStore));

export default settingsStore;
