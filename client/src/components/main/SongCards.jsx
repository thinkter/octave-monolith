import React from 'react';
import PropTypes from 'prop-types';

import SongCard from './SongCard';

const QueueCards = props => {
  const { reRenderQueue, queue } = props;

  if (queue.length === 0)
    return (
      <div className="bg-faded px-8 sm:px-12 py-4 shadow-lg mb-1 text-white song-title text-xl sm:text-2xl">
        Song not found in queue
      </div>
    );

  return queue.map(songInfo => (
    <SongCard
      styles="mb-1"
      songInfo={songInfo}
      key={songInfo.id}
      reRenderQueue={reRenderQueue}
    />
  ));
};

const SearchCards = props => {
  const {
    searchList,
    reRenderQueue,
    queue,
    show,
    submitted,
    addToQueue
  } = props;

  if (!show) return <div />;
  if (!submitted) {
    return (
      <div className="bg-secondary px-8 sm:px-12 py-4 shadow-lg text-faded text-sm sm:text-xl ">
        Please Wait Patiently... 
      </div>
    );
  }
  if (submitted && searchList === null) {
    return (
      <div className="bg-secondary px-8 sm:px-12 py-4 shadow-lg text-faded text-sm sm:text-xl ">
        Searching...
      </div>
    );
  }
  if (submitted && searchList.length === 0) {
    return (
      <div className="bg-secondary px-8 sm:px-12 py-4 shadow-lg text-faded text-sm sm:text-xl song-title">
        Song not found
      </div>
    );
  }
  return (
    <div>
      <div className="bg-secondary px-8 sm:px-12 py-4 shadow-lg text-faded text-sm sm:text-xl song-title">
        New Songs:
      </div>
      {searchList.map(songInfo => {
        if (queue.some(song => song.id === songInfo.id && song.upvotes !== 0))
          return <div key={songInfo.id} />;
        return (
          <SongCard
            addNew
            styles="mb-1"
            songInfo={songInfo}
            key={songInfo.id}
            reRenderQueue={reRenderQueue}
            addToQueue={addToQueue}
          />
        );
      })}
    </div>
  );
};

export { QueueCards, SearchCards };

SearchCards.propTypes = {
  searchList: PropTypes.arrayOf(PropTypes.any),
  reRenderQueue: PropTypes.func,
  queue: PropTypes.arrayOf(PropTypes.any),
  show: PropTypes.bool,
  submitted: PropTypes.bool,
  addToQueue: PropTypes.func
};

SearchCards.defaultProps = {
  searchList: [],
  reRenderQueue: () => [],
  show: 0,
  submitted: 0,
  addToQueue: () => [],
  queue: []
};
