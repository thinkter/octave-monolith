import React from 'react';
import PropTypes from 'prop-types';

import { upvoteTrack, requestSong } from '../../requests';

import { ReactComponent as EmptyHeart } from '../../icons/EmptyHeart.svg';
import { ReactComponent as FilledHeart } from '../../icons/FilledHeart.svg';

class SongCard extends React.Component {
  constructor() {
    super();

    this.state = {
      isLiked: false,
      upvotes: 0
    };

    this.handleLike = this.handleLike.bind(this);
  }

  componentDidMount() {
    const { songInfo } = this.props;
    if (songInfo.upvoted) this.setState(() => ({ isLiked: true }));
    this.setState({ upvotes: songInfo.upvotes ? songInfo.upvotes : 0 });
  }

  handleLike() {
    const { songInfo, reRenderQueue, addNew, addToQueue } = this.props;
    const { isLiked, upvotes } = this.state;
    if (isLiked) {
      this.setState({ upvotes: upvotes - 1 });
    } else {
      this.setState({ upvotes: upvotes + 1 });
    }
    this.setState({ isLiked: !isLiked });
    if (!addNew) {
      upvoteTrack(songInfo.id)
        .then(() => reRenderQueue(songInfo.id))
        .catch(err => {
          console.log(err);
        });
    } else {
      addToQueue(songInfo);
      requestSong(songInfo.id)
        .then(() => reRenderQueue(null, songInfo.id))
        .catch(err => {
          console.log(err);
        });
    }
  }

  render() {
    const { styles, songInfo } = this.props;
    const { isLiked, upvotes } = this.state;

    const heart = isLiked ? <FilledHeart /> : <EmptyHeart />;
    // Defensive defaults for media and artist
    const mediaUrl = (() => {
      if (!songInfo) return '';
      if (typeof songInfo.media === 'string') return songInfo.media;
      if (Array.isArray(songInfo.media) && songInfo.media.length > 0) {
        // prefer an item that has a url property; fall back to first
        const found = songInfo.media.find(m => m && (m.url || m.src));
        return (found && (found.url || found.src)) || (songInfo.media[0] && songInfo.media[0].url) || '';
      }
      // sometimes media may be an object
      if (songInfo.media && typeof songInfo.media === 'object') return songInfo.media.url || '';
      return '';
    })();

    const artists = Array.isArray(songInfo.artist)
      ? songInfo.artist
      : songInfo.artist
      ? [songInfo.artist]
      : [];

    return (
      <div
        className={`bg-faded px-4 sm:px-12 py-4 shadow-lg flex justify-between items-center ${styles}`}
      >
        <div className="flex justify-start items-start mr-1 w-9/12">
          <div className="mr-2 w-3/12 sm:w-2/12">
            <img src={mediaUrl} alt="Album Art" />
          </div>
          <div className="w-9/12 sm:w-10/12">
            <div className="text-white song-title text-xl sm:text-2xl leading-tight">
              {songInfo.title || songInfo.name}
            </div>
            <div className="text-faded text-sm sm:text-xl">
              {artists.join(', ')}
            </div>
          </div>
        </div>
        <div className="flex text-xl sm:text-2xl text-contrast">
          <div>{upvotes}</div>
          <div
            className="ml-4 cursor-pointer focus:outline-none"
            role="button"
            tabIndex={0}
            // onClick={this.handleLike}
            onClick={this.handleLike}
          >
            {heart}
          </div>
        </div>
      </div>
    );
  }
}

export default SongCard;

SongCard.propTypes = {
  styles: PropTypes.string,
  songInfo: PropTypes.objectOf(PropTypes.any),
  reRenderQueue: PropTypes.func,
  addNew: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  addToQueue: PropTypes.func
};

SongCard.defaultProps = {
  styles: '',
  songInfo: {},
  reRenderQueue: () => [],
  addNew: 0,
  addToQueue: () => []
};
