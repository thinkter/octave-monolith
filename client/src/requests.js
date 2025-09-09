import axios from 'axios';
import qs from 'querystring';

const baseURL = 'https://acmoctave.azurewebsites.net';

// const getQueue = () => {
//   return new Promise(resolve => {
//     axios({
//       method: 'GET',
//       url: `${baseURL}/api/leaderboard`,
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     }).then(res => resolve(res.data.data));
//   });
// };

function getQueue() {
  // Return a Promise-resolved sample queue so callers can use .then()
  return Promise.resolve([
    {
      id: '12345',
      name: 'Song Title',
      artist: ['Artist Name 1', 'Artist Name 2'],
      explicit: false,
      popularity: 80,
      media: [
        { height: 640, url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9e7qTVSKT3OGc3hRtuGxW-SjrY1ACbbq2Ow&s' },
      ],
      url: 'https://open.spotify.com/track/12345',
      length: 210000
    },

    {
      id: '12346',
      name: 'Song Title',
      artist: ['Artist Name 1', 'Artist Name 2'],
      explicit: false,
      popularity: 80,
      media: [
        { height: 640, url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9e7qTVSKT3OGc3hRtuGxW-SjrY1ACbbq2Ow&s' },
      ],
      url: 'https://open.spotify.com/track/12345',
      length: 210000
    }
    // ...add more song objects as needed
  ]);
}

function getUser() {
  // Components expect a user object (not an array) and code calls user.name / user.picture
  return Promise.resolve({
    name: 'User Name',
    email: 'user@example.com',
    picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9e7qTVSKT3OGc3hRtuGxW-SjrY1ACbbq2Ow&s'
  });
}
// function getNowPlaying() {
//   // Return a single nowPlaying object compatible with components that read
//   // nowPlaying.message, nowPlaying.name, nowPlaying.artist and nowPlaying.media
//   return Promise.resolve({
//     id: '67890',
//     message: 'Playing',
//     name: 'MANIQUINN',
//     upvotes: 17,
//     upvoted: false,
//     artist: ['CHE'],
//     // PlayingCard expects media to be a string url in the patched component
//     media: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9e7qTVSKT3OGc3hRtuGxW-SjrY1ACbbq2Ow&s'
//   });
// }

// function getNowPlaying() {
//   // Return a single nowPlaying object compatible with components that read
//   // nowPlaying.message, nowPlaying.name, nowPlaying.artist and nowPlaying.media
//   return Promise.resolve({
//     id: '67890',
//     message: 'Playing',
//     name: 'MANIQUINN',
//     upvotes: 17,
//     upvoted: false,
//     artist: ['CHE'],
//     // PlayingCard expects media to be a string url in the patched component
//     media: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9e7qTVSKT3OGc3hRtuGxW-SjrY1ACbbq2Ow&s'
//   });
// }
// const getUser = () => {
//   return new Promise(resolve => {
//     axios({
//       method: 'GET',
//       url: `${baseURL}/api/profile`,
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     }).then(res => resolve(res.data));
//   });
// };

// const getNowPlaying = () => {
//   return new Promise(resolve => {
//     axios({
//       method: 'GET',
//       url: `${baseURL}/api/live`,
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     }).then(res => resolve(res.data));
//   });
// };

// const getSearch = songQuery => {
//   return new Promise(resolve => {
//     axios({
//       method: 'POST',
//       url: `${baseURL}/api/search`,
//       data: qs.stringify({
//         query: songQuery
//       }),
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     }).then(res => {
//       // console.log(res);
//       return resolve(res);
//     });
//   });
// };

const getSearch = songQuery => {
  return new Promise((resolve, reject) => {
    axios
      .get('http://127.0.0.1:5000/search', {
      // .get('https://0d10e5b138b4.ngrok-free.app/search', {
        params: { q: songQuery },
        headers: { Accept: 'application/json' }
      })
      .then(res => {
        resolve(res);
        console.log(res);
      })
      .catch(err => reject(err));
  });
};

function getNowPlaying() {
  return new Promise((resolve, reject) => {
    axios
      .get('http://127.0.0.1:5000/live', {
        headers: { Accept: 'application/json' }
      })
      .then(res => {
        resolve(res.data[0]);
        console.log(res.data[0]);
      })
      .catch(err => reject(err));
  });
}

const requestSong = songID => {
  return new Promise(resolve => {
    axios({
      method: 'POST',
      url: `${baseURL}/api/request`,
      data: qs.stringify({
        id: songID
      }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => resolve(res));
  });
};

const upvoteTrack = songID => {
  return new Promise(resolve => {
    axios({
      method: 'POST',
      url: `${baseURL}/api/upvote`,
      data: qs.stringify({
        id: songID
      }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => resolve(res));
  });
};

export {
  getQueue,
  getUser,
  getNowPlaying,
  getSearch,
  requestSong,
  upvoteTrack
};
