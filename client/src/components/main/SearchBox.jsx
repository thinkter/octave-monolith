import React from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';

import { getSearch } from '../../requests';

class SearchBox extends React.Component {
  constructor() {
    super();

  this.handleSubmit = this.handleSubmit.bind(this);
  this.handleInputChange = this.handleInputChange.bind(this);
  this.debounceTimer = null;
  }

  componentDidMount() {
    gsap.from('.search-box', { opacity: 0, duration: 1, y: 30 });
  }

  componentWillUnmount() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  handleSubmit(e) {
    const { sendToSearchQueue, searchVal, emptyBox } = this.props;
    e.preventDefault();
    // clear any pending debounced search to avoid duplicate calls
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    sendToSearchQueue(null, true);
    // minimum length 3
    if (searchVal.length >= 3) {
      getSearch(searchVal)
        .then(songSearch => {
          sendToSearchQueue(songSearch.data, true);
        })
        .catch(err => console.log(err));
    } else {
      emptyBox();
    }
  }

  handleInputChange(e) {
    const { searchSong, sendToSearchQueue, emptyBox } = this.props;
    const val = e.target.value;

    // update parent/state immediately so input stays controlled
    searchSong(val);

    // clear previous timer
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // only trigger search when user has typed at least 3 characters
    if (val.length >= 3) {
      // indicate loading / clearing previous results
      sendToSearchQueue(null, true);

      this.debounceTimer = setTimeout(() => {
        getSearch(val)
          .then(songSearch => {
            sendToSearchQueue(songSearch.data, true);
          })
          .catch(err => console.log(err));
        this.debounceTimer = null;
      }, 300);
    } else {
      // if fewer than 3 chars, clear search results
      emptyBox();
    }
  }

  render() {
    const { searchVal} = this.props;

    return (
      <form
        className="search-box flex flex-row z-40"
        onSubmit={this.handleSubmit}
      >
        <input
          type="text"
          className="bg-faded px-8 py-0 text-base sm:text-xl text-white box-border w-9/12 sm:w-11/12 placeholder-white"
          placeholder="Add a Song to Queue"
          value={searchVal}
          onChange={this.handleInputChange}
        />
        <input
          type="submit"
          className="h-full w-3/12 sm:w-1/12 cursor-pointer text-5xl leading-none hover:bg-green-700 bg-contrast"
          value="+"
        />
      </form>
    );
  }
}

export default SearchBox;

SearchBox.propTypes = {
  sendToSearchQueue: PropTypes.func,
  searchVal: PropTypes.string,
  searchSong: PropTypes.func,
  emptyBox: PropTypes.func
};

SearchBox.defaultProps = {
  sendToSearchQueue: () => [],
  searchVal: '',
  searchSong: () => [],
  emptyBox: () => []
};
