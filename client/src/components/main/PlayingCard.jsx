import React from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';

class PlayingCard extends React.Component {
  componentDidMount() {
    gsap.from('.playing-card', { opacity: 0, duration: 1, y: 30 });
  }

  render() {
    const { nowPlaying } = this.props;
    // Defensive guards: nowPlaying may be an empty object while async data loads.
    const message = nowPlaying && nowPlaying.message;
    const isPaused = message === 'Playback Paused';

    if (!isPaused && nowPlaying) {
      const media = nowPlaying.media[0].url || '';
      const title = nowPlaying.name || '';
      const artists = Array.isArray(nowPlaying.artist)
        ? nowPlaying.artist
        : nowPlaying.artist
        ? [nowPlaying.artist]
        : [];

      return (
        <div className="playing-card bg-secondary shadow-lg">
          <img src={media} alt="Album Art" className="w-full px-10 py-5" />
          <div className="mx-10 pb-5">
            <div className="text-white text-xl sm:text-4xl song-title">
              {title}
            </div>
            <div className="text-white text-sm sm:text-xl text-faded">
              {artists.join(', ')}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="playing-card bg-secondary shadow-lg py-4">
        <div id="circuleExtern">
          <div id="circuleMedium">
            <div id="circuleCenter" />
          </div>
        </div>
        <div className="mx-10 pb-5 mt-4">
          <div className="text-white text-xl sm:text-4xl song-title text-center">
            Playback Paused
          </div>
        </div>
      </div>
    );
  }
}

export default PlayingCard;

PlayingCard.propTypes = {
  nowPlaying: PropTypes.objectOf(PropTypes.any)
};

PlayingCard.defaultProps = {
  nowPlaying: {}
};
