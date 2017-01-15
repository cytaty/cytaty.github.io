import React from "react";
import SettingsStore from "../../stores/SettingsStore";

import QuotesStore from "../../stores/QuotesStore";

export default class Input extends React.Component {
  constructor() {
    super();
    this.setTouched = this.setTouched.bind(this);
    this.setDirty = this.setDirty.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.clearState = this.clearState.bind(this);
    this.openLabel = this.openLabel.bind(this);
    this.closeLabel = this.closeLabel.bind(this);
    this.getTeachers = this.getTeachers.bind(this);
    this.validate = this.validate.bind(this);
    this.state = {
      dirty: false,
      touched: false,
      valid: true,
      value: "",
      selectValue: "",
      radioSelected: 0,
      openSelect: false,
      teachers: [{ "id": -1, "name": "" }],
    };
  }

  componentWillMount() {
    SettingsStore.on("settingsChange", this.clearState);
    QuotesStore.on("teachersUpdate", this.getTeachers);

    if ( this.props.type === "select" ) {
      const value = this.state.teachers[0];

      this.setState({ selectValue: value.name });
      this.props.setValue(this.props.id, value.id);
    }

    const makeValid = this.props.makeValid;
    const id = this.props.id;

    if ( this.props.required ) {
      makeValid(id, false);
    }
  }

  componentWillUnmount() {
    SettingsStore.removeListener("settingsChange", this.clearState);
    QuotesStore.removeListener("teachersUpdate", this.getTeachers);
  }

  getTeachers() {
    if ( this.props.type === "select" ) {
      const teachers = QuotesStore.returnTeachers();
      this.setState({
        teachers,
        selectValue: teachers[0].name,
        radioSelected: 0,
      });

      this.setState({
        value: teachers[0].name,
      });
      this.props.setValue(this.props.id, teachers[0].id);
    }
  }

  setTouched() {
    this.setState({ touched: true });
  }

  setDirty(e) {
    if ( e.target.value !== "" ) {
      this.setState({ dirty: true });
    } else {
      this.setState({ dirty: false });
    }
  }

  clearState() {
    this.setState({
      dirty: false,
      touched: false,
      valid: true,
      value: "",
      selectValue: "",
      radioSelected: 0,
      openSelect: false,
    });
  }

  validate(e) {
    const makeValid = this.props.makeValid;
    const id = this.props.id;
    if ( this.props.required ) {
      if ( e.target.value !== "" ) {
        this.setState({ valid: true });
        makeValid(id, true);
      } else {
        this.setState({ valid: false });
        makeValid(id, false);
      }
    } else {
      makeValid(id, true);
    }
  }

  handleBlur(e) {
    this.validate(e);
    this.setState({ touched: true });
  }

  handleChange(e) {
    let value = "";
    if ( this.props.type === "select" ) {
      value = e.target.selectedOptions[0].id;
    } else {
      value = e.target.value;
    }

    this.setDirty(e);
    this.setState({
      value: e.target.value,
    });
    this.validate(e);
    this.props.setValue(this.props.id, value);
  }

  handleRadio(e) {
    const elId = e.target.id.substring(this.props.id.length + 1) * 1;
    const value = this.state.teachers[elId];
    this.setDirty(e);
    this.setState({
      value: e.target.value,
      selectValue: value.name,
      radioSelected: elId,
    });
    this.validate(e);
    this.props.setValue(this.props.id, value.id);
  }

  openLabel() {
    this.setState({ openSelect: true });
  }

  closeLabel() {
    setTimeout(() => {
      this.setState({ openSelect: false });
    }, 100);
  }

  render() {
    const classNames = [];

    if ( this.state.touched ) {
      classNames.push("touched");
    }

    if ( this.state.dirty ) {
      classNames.push("dirty");
    }

    if ( !this.state.valid ) {
      classNames.push("invalid");
    }

    switch (this.props.type) {
      case "input":
        return (<input onBlur={this.handleBlur} onChange={this.handleChange} type="text" value={this.state.value} className={classNames.join(" ")} id={this.props.id} required={this.props.required} />);
      case "textarea":
        return (<textarea onBlur={this.handleBlur} onChange={this.handleChange} type="text" value={this.state.value} className={classNames.join(" ")} id={this.props.id} required={this.props.required} />);
      case "select": // eslint-disable-line
        const options = [];
        const radioOptions = [];
        this.state.teachers.forEach((v, i) => {
          options.push(
            <input onChange={this.handleRadio} name={this.props.id} key={`${this.props.id}-${i}`} id={`${this.props.id}-${i}`} type="radio" checked={i === this.state.radioSelected} />
          );

          let className = "";
          if ( i === this.state.radioSelected ) {
            className += "current";
          }

          radioOptions.push(
            <label key={`${this.props.id}-label-${i}`} htmlFor={`${this.props.id}-${i}`} className={className}>{v.name}</label>
          );
        });

        return (
          <div className="select-group">
            {options}
            <div className={(this.state.openSelect) ? "select-container open" : "select-container"}>
              <button onBlur={this.closeLabel} onClick={this.openLabel} onFocus={this.openLabel} type="button">
                {this.state.selectValue}
                <i className="material-icons">arrow_drop_down</i>
              </button>
              <div className="select-options-container">
                <div className="select-options">
                  {radioOptions}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

Input.propTypes = {
  id: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool,
  makeValid: React.PropTypes.func,
  setValue: React.PropTypes.func,
};
