import dispatcher from "../dispatcher";

export function createQuote(obj) {
  dispatcher.dispatch({
    type: "CREATE_QUOTE",
    text: obj.text,
    teacher: obj.teacher,
    info: obj.info,
    name: obj.name,
  });
}

export function createTeacher(obj) {
  dispatcher.dispatch({
    type: "CREATE_TEACHER",
    name: obj.name,
  });
}

export function refreshQuotes() {
  dispatcher.dispatch({
    type: "REFRESH_QUOTES",
  });
}

export function refreshTeachers() {
  dispatcher.dispatch({
    type: "REFRESH_TEACHERS",
  });
}
