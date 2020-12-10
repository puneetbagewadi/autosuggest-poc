import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import getSuggestions from "./getSuggestions";
import _ from "lodash";

class Autocomplete extends Component {
  static propTypes = {
    suggestions: PropTypes.instanceOf(Array),
  };

  static defaultProps = {
    suggestions: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: "",
    };
  }

  onChange = (event) => {
    event.persist();
    const userInput = event.target.value;
    this.setState({
      userInput,
      showSuggestions: false,
    });

    if (!this.debouncedFn) {
      this.debouncedFn = _.debounce(() => {
        this.getSuggestionsWithAsync(userInput);
      }, 1000);
    }
    this.debouncedFn();
  };

  getSuggestionsWithAsync = async (inputText) => {
    try {
      const suggestions = await getSuggestions(inputText);
      console.log(suggestions);
      this.setState({
        activeSuggestion: 0,
        filteredSuggestions: suggestions,
        showSuggestions: true,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        filteredSuggestions: [],
        showSuggestions: false,
      });
    }
  };


  onSuggestionClick = (e) => {
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: e.currentTarget.innerText,
    });
  };

  onKeyDown = (e) => {
    const { activeSuggestion, filteredSuggestions } = this.state;

    if (e.keyCode === 13) {
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: filteredSuggestions[activeSuggestion],
      });
    } else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
    } else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
  };

  render() {
    const {
      activeSuggestion,
      filteredSuggestions,
      showSuggestions,
      userInput,
    } = this.state;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              if (index === activeSuggestion) {
                className = "suggestion-active";
              }

              return (
                <li
                  className={className}
                  key={suggestion}
                  onClick={this.onSuggestionClick}
                >
                  {suggestion}
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div className="no-suggestions">
            <em>No suggestions !</em>
          </div>
        );
      }
    }

    return (
      <Fragment>
        <input
          type="text"
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          value={userInput}
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;
