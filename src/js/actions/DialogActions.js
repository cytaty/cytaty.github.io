import dispatcher from "../dispatcher";

export function show(browser) {
  dispatcher.dispatch({
    type: "SHOW_DIALOG",
    browser,
  });
}

export function hide() {
  dispatcher.dispatch({
    type: "HIDE_DIALOG",
  });
}
