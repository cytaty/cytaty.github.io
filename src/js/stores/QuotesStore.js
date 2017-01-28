import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

import * as SnackbarActions from "../actions/SnackbarActions";

class QuotesStore extends EventEmitter {
  constructor() {
    super();
    this.quotes = [];
    this.teachers = [{ "id": -1, "name": "" }];
  }

  createQuote(text, teacher, info, name) {
    $.ajax({
      method: "POST",
      url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/add_quote.php",
      data: {
        text,
        teacher,
        date: "",
        info,
        name,
      },
    })
    .done(() => {
      SnackbarActions.show("Wysłano cytat do zaakceptowania.");
      this.emit("change");
    })
    .fail(() => {
      console.log( "" );
    });
  }

  createTeacher(name) {
    $.ajax({
      method: "POST",
      url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/add_teacher.php",
      data: {
        name,
      },
    })
    .done(() => {
      SnackbarActions.show("Dodano nauczyciela.");
      this.emit("change");
    })
    .fail(() => {
      console.log( "" );
    });
  }

  refreshQuotes() {
    $.ajax({
      method: "POST",
      url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/get_quotes.php",
    })
    .done(( msgA ) => {
      const msg = (msgA === Object(msgA)) ? msgA : JSON.parse(msgA);
      this.quotes = msg;

      this.emit("change");
    })
    .fail(() => {
      console.log( "" );
    });
  }

  refreshTeachers() {
    $.ajax({
      method: "POST",
      url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/get_teachers.php",
    })
    .done(( msg ) => {
      this.teachers = msg;

      this.emit("teachersUpdate");
    })
    .fail(() => {
      console.log( "" );
    });
  }

  returnTeachers() {
    return this.teachers;
  }

  getAll() {
    return this.quotes;
  }

  /* eslint-disable default-case */
  handleActions(action) {
    switch (action.type) {
      case "CREATE_QUOTE":
        this.createQuote(action.text, action.teacher, action.info, action.name);
        break;
      case "CREATE_TEACHER":
        this.createTeacher(action.name);
        break;
      case "REFRESH_QUOTES":
        this.refreshQuotes();
        break;
      case "REFRESH_TEACHERS":
        this.refreshTeachers();
        break;
    }
  }
  /* eslint-enable default-case */
}

const quotesStore = new QuotesStore();
dispatcher.register(quotesStore.handleActions.bind(quotesStore));

export default quotesStore;
