import dispatcher from "../dispatcher";

export function show(text) {
  dispatcher.dispatch({
    type: "SHOW_SNACK",
    text,
  });
}

export function hide() {
  dispatcher.dispatch({
    type: "HIDE_SNACK",
  });
}
