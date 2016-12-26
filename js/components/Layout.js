import React from "react";

import FloatingAB from "../components/FloatingAB";
import Header from "../components/Header";
import Section from "../components/Section";
import Settings from "../components/Settings";
import Snackbar from "../components/Snackbar";

import QuotesStore from "../stores/QuotesStore";
import * as QuotesActions from "../actions/QuotesActions";

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

    QuotesActions.refreshQuotes();
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
      </div>
    );
  }
}
