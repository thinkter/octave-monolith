import React from 'react';
import PropTypes from 'prop-types';

import { getQueue, getUser, getNowPlaying } from '../requests';

import Navbar from '../components/main/Navbar';
import PlayingSection from '../components/main/PlayingSection';
import QueueSection from '../components/main/QueueSection';
import LoadingAnimation from '../components/LoadingAnimation';

class MainPage extends React.Component {
  constructor() {
    super();

    this.state = {
      search: '',
      submitted: false
    };

    this.emptySearch = this.emptySearch.bind(this);
    this.sendToSearchQueue = this.sendToSearchQueue.bind(this);
    this.reRenderQueue = this.reRenderQueue.bind(this);
    this.searchSong = this.searchSong.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
  }

  componentWillUnmount() {
    // clear polling interval if set
    if (this._pollInterval) clearInterval(this._pollInterval);
  }

  componentDidMount() {
    // initialize with safe defaults to avoid undefined access in render
    this.setState({ queue: [], user: null, nowPlaying: null });

    // Debug: log a parsed snapshot of localStorage so we can inspect values
    try {
      const lsSnapshot = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        let val = localStorage.getItem(key);
        try {
          val = JSON.parse(val);
        } catch (e) {
          // leave as string if not JSON
        }
        lsSnapshot[key] = val;
      }
      console.log('localStorage snapshot:', lsSnapshot);
    } catch (err) {
      console.log('localStorage not available or error reading it:', err);
    }

  getQueue()
      .then(queue => {
        // console.log(queue);
        this.setState({ queue });
      })
      .catch(err => {
        console.log(err);
      });

    getUser()
      .then(user => {
        this.setState({ user });
      })
      .catch(err => console.log(err));

    getNowPlaying()
      .then(nowPlaying => {
        this.setState({ nowPlaying });
      })
      .catch(err => console.log(err));

  this._pollInterval = setInterval(() => {
      getNowPlaying()
        .then(nowPlaying => {
          this.setState({ nowPlaying });
        })
        .catch(err => console.log(err));
      getQueue()
        .then(queue => {
          this.setState({ queue });
        })
        .catch(err => {
          console.log(err);
        });
    }, 10000);
  }

  searchSong(search) {
    this.setState({ submitted: false });
    this.setState({ search });
  }

  sendToSearchQueue(searchList, submitted) {
    // console.log(searchList);
    this.setState({ searchList, submitted });
  }

  reRenderQueue() {
    getQueue()
      .then(queue => {
        this.setState({ queue });
      })
      .catch(err => {
        console.log(err);
      });
  }

  addToQueue(songInfo) {
    const { queue } = this.state;

    const song = {
      artist: songInfo.artist,
      id: songInfo.id,
      media: songInfo.media,
      title: songInfo.name,
      upvoted: true,
      upvotes: 1
    };

    queue.push(song);
    this.setState({ queue });
  }

  emptySearch() {
    this.setState({ search: '' });
  }

  render() {
    const { history } = this.props;
    const {
      user,
      nowPlaying,
      queue,
      searchList,
      submitted,
      search
    } = this.state;

    if (user && nowPlaying && queue)
      return (
        <div className="bg-primary h-full cursor-default overflow-auto">
          <Navbar
            history={history}
            username={user?.name}
            avatar={user?.picture}
          />
          <div className="mx-4 sm:mx-32 flex flex-col md:flex-row">
            <PlayingSection nowPlaying={nowPlaying} />
            <div className="w-full md:w-7/12 flex flex-col">
              <QueueSection
                queue={queue}
                sendToSearchQueue={this.sendToSearchQueue}
                submitted={submitted}
                searchList={searchList}
                reRenderQueue={this.reRenderQueue}
                searchVal={search}
                searchSong={this.searchSong}
                addToQueue={this.addToQueue}
              />
            </div>
          </div>
        </div>
      );
    return <LoadingAnimation />;
  }
}

export default MainPage;

MainPage.propTypes = {
  history: PropTypes.objectOf(PropTypes.any)
};

MainPage.defaultProps = {
  history: {}
};
