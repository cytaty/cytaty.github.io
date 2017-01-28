import React from "react";

import FloatingAB from "../components/FloatingAB";
import Header from "../components/Header";
import Section from "../components/Section";
import Settings from "../components/Settings";
import Snackbar from "../components/Snackbar";
import Dialog from "../components/Dialog";

import QuotesStore from "../stores/QuotesStore";
import * as QuotesActions from "../actions/QuotesActions";

import * as DialogActions from "../actions/DialogActions";

export default class Layout extends React.Component {
  constructor() {
    super();
    this.getQuotes = this.getQuotes.bind(this);
    this.state = {
      quotes: QuotesStore.getAll(),
    };
  }

  componentWillMount() {
    QuotesStore.on("change", this.getQuotes);

    QuotesActions.refreshTeachers();
    QuotesActions.refreshQuotes();
  }

  componentDidMount() {
    const checkBrowser = () => {
      const ua = navigator.userAgent;
      if (/Android/i.test(ua) && /Chrome/i.test(ua)) {
        return "Android Chrome";
      }

      const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
      const webkit = !!ua.match(/WebKit/i);
      const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

      if ( iOSSafari ) {
        return "iOS Safari";
      }

      return "";
    };

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop().split(";").shift();
      }

      return false;
    };

    if ( !getCookie("mainPage") && !navigator.standalone ) {
      DialogActions.show( checkBrowser() );
    }
  }

  componentWillUnmount() {
    QuotesStore.removeListener("change", this.getQuotes);
  }

  getQuotes() {
    this.setState({
      quotes: QuotesStore.getAll(),
    });
  }

  createQuote() {
    QuotesActions.createQuote(Date.now(), Date.now() * 2);
  }

  render() {
    const { quotes } = this.state;

    const quotesList = quotes.map((quote) => {
      return <Section quote={quote} key={quote.id} />;
    });

    return (
      <div>
        <Header />
        <main>
          { quotesList }
        </main>
        <FloatingAB />
        <Settings />
        <Snackbar />
        <Dialog />
      </div>
    );
  }
}
