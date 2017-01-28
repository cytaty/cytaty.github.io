import React from "react";
import SettingsStore from "../stores/SettingsStore";
import * as SettingsActions from "../actions/SettingsActions";

import Main from "./Settings/Main";

export default class Settings extends React.Component {
  constructor() {
    super();
    this.toggleSettings = this.toggleSettings.bind(this);
    this.state = {
      visible: SettingsStore.getSettingsVisible(),
      tab: SettingsStore.getTab(),
    };
  }

  componentWillMount() {
    SettingsStore.on("settingsChange", this.toggleSettings);
  }

  componentWillUnmount() {
    SettingsStore.removeListener("settingsChange", this.toggleSettings);
  }

  toggleSettings() {
    this.setState({
      visible: SettingsStore.getSettingsVisible(),
      tab: SettingsStore.getTab(),
    });
  }

  hideSettings() {
    SettingsActions.showSettings(null);
  }

  isVisible() {
    if ( this.state.visible ) {
      document.body.className = "settings-shown";
      return " shown";
    }
    document.body.className = "";
    return "";
  }

  showTab(a) {
    SettingsActions.showSettings(a);
  }

  changeTab(a) {
    SettingsActions.changeTab(a);
  }

  render() {
    const classNamePane = `settings-pane${this.isVisible()}`;
    let content = null;
    let QuotesClasses = "blink-big";
    let TeachersClasses = "blink-big";


    switch (this.state.tab) {
      case "quotes":
        // content = (<Quotes />);
        QuotesClasses = `selected ${QuotesClasses}`;
        break;
      case "teachers":
        // content = (<Teachers />);
        TeachersClasses = `selected ${TeachersClasses}`;
        break;
      default:
        content = null;
    }

    return (
      <div className={classNamePane}>
        <header className="app-bar">
          <div className="status-bar" />
          <nav>
            <div className="icons left">
              <button onClick={this.hideSettings} className="search blink"><i className="material-icons">close</i></button>
              <span>Nowy rekord</span>
            </div>
          </nav>
          <ul className="tabs">
            <li className={QuotesClasses}><button onClick={this.changeTab.bind(this, "quotes")}>CYTATY</button></li>
            <li className={TeachersClasses}><button onClick={this.changeTab.bind(this, "teachers")}>NAUCZYCIELE</button></li>
          </ul>
        </header>
        <main>
          <Main tab={this.state.tab} />
        </main>
      </div>
    );
  }
}
