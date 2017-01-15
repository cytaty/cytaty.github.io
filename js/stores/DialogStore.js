import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

class DialogStore extends EventEmitter {
  constructor() {
    super();
    this.hideDialog = this.hideDialog.bind(this);
    this.visible = false;
    this.text = "";
  }

  showDialog(browser) {
    this.visible = true;
    const tutorialIntro = "Aby dodać tę stronę do ekranu głównego i używać jej jak zwykłej aplikacji:";
    switch (browser) { // eslint-disable-line default-case
      case "Android Chrome":
        this.text = `${tutorialIntro}<br>1. Naciśnij „więcej opcji”&nbsp;<i class="material-icons">more_vert</i><br>2. Naciśnij „Dodaj do ekranu głównego”`;
        break;
      case "iOS Safari":
        this.text = `${tutorialIntro}<br>1. Naciśnij „przycisk udostępniania”&nbsp;&nbsp;<img class="apple-icon" src="./img/apple-share-button.png"><br>2. Naciśnij „Dodaj do ekranu początk.”&nbsp;&nbsp;<img class="apple-icon" src="./img/apple-add-button.png">`;
        break;
      default:
        this.text = "";
        this.visible = false;
    }

    this.emit("dialogChange");
  }

  hideDialog() {
    this.visible = false;
    this.emit("dialogChange");
  }

  getProps() {
    return { visible: this.visible, text: this.text };
  }

  /* eslint-disable default-case */
  handleActions(action) {
    switch (action.type) {
      case "SHOW_DIALOG":
        this.showDialog(action.browser);
        break;
      case "HIDE_DIALOG":
        this.hideDialog();
        break;
    }
  }
  /* eslint-enable default-case */
}

const dialogStore = new DialogStore();
dispatcher.register(dialogStore.handleActions.bind(dialogStore));

export default dialogStore;
