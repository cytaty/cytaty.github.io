import { EventEmitter } from "events";
import { parse } from "csv-parse";

import dispatcher from "../dispatcher";

import * as SnackbarActions from "../actions/SnackbarActions";


const parseCsv = (data) => {
  return new Promise((resolve, reject) => {
    parse(data, { columns: true }, (err, records) => {
      if (err != null) {
        reject(err);
        return;
      }

      resolve(records);
    });
  });
};

class QuotesStore extends EventEmitter {
  constructor() {
    super();
    this.quotes = [];
    this.teachers = [{ "id": -1, "name": "" }];
  }

  createQuote(text, teacher, info, name) {
    console.log("createQuote", text, teacher, info, name);

    setTimeout(() => {
      this.emit("change");
      SnackbarActions.show("Funkcja aktualnie niedostępna.");
    }, 0);

    // $.ajax({
    //   method: "POST",
    //   url: "https://cytaty.legiec.io/add_quote.php",
    //   data: {
    //     text,
    //     teacher,
    //     date: "",
    //     info,
    //     name,
    //   },
    // })
    // .done(() => {
    //   SnackbarActions.show("Wysłano cytat do zaakceptowania.");
    //   this.emit("change");
    // })
    // .fail(() => {
    //   console.log( "" );
    // });
  }

  createTeacher(name) {
    console.log("createTeacher", name);

    setTimeout(() => {
      this.emit("change");
      SnackbarActions.show("Funkcja aktualnie niedostępna.");
    }, 0);

    // $.ajax({
    //   method: "POST",
    //   url: "https://cytaty.legiec.io/add_teacher.php",
    //   data: {
    //     name,
    //   },
    // })
    // .done(() => {
    //   SnackbarActions.show("Dodano nauczyciela.");
    //   this.emit("change");
    // })
    // .fail(() => {
    //   console.log( "" );
    // });
  }

  async refreshQuotes() {
    const data = await fetch("/data/quotes.csv").then((res) => { return res.text(); });
    const records = await parseCsv(data);

    const teachers = await this.fetchTeachers();
    const teachersMap = Object.fromEntries(teachers.map((t) => { return [t.id, t]; }));

    const msg = records.sort((a, b) => { return b.id - a.id; }).map((record) => {
      return ({
        id: record.id,
        text: record.text,
        teacher: teachersMap[record.teacher_id].name,
        dateAdded: record.date_added,
        info: record.info,
      });
    });

    this.quotes = msg;

    this.emit("change");
  }

  async fetchTeachers() {
    const data = await fetch("/data/teachers.csv").then((res) => { return res.text(); });
    const records = await parseCsv(data);

    return records;
  }

  async refreshTeachers() {
    const teachers = await this.fetchTeachers();
    this.teachers = teachers;

    this.emit("teachersUpdate");
  }

  returnTeachers() {
    return this.teachers;
  }

  getAll() {
    return this.quotes;
  }

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
      // no default
    }
  }
}

const quotesStore = new QuotesStore();
dispatcher.register(quotesStore.handleActions.bind(quotesStore));

export default quotesStore;
