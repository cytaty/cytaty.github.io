import dispatcher from "../dispatcher";

export function showSettings(tab) {
  dispatcher.dispatch({
    type: "SHOW_SETTINGS",
    tab,
  });
}

export function changeTab(tab) {
  dispatcher.dispatch({
    type: "CHANGE_TAB",
    tab,
  });
}
