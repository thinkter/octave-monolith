/api/leaderboard
[
  {
    "id": "12345",
    "title": "Song Title",
    "upvotes": 42,
    "upvoted": true,
    "artist": ["Artist Name 1", "Artist Name 2"],
    "media": [
      {
        "sideDimension": 640,
        "url": "https://i.scdn.co/image/abc123"
      },
      {
        "sideDimension": 300,
        "url": "https://i.scdn.co/image/def456"
      }
    ]
  },
  {
    "id": "67890",
    "title": "Another Song",
    "upvotes": 17,
    "upvoted": false,
    "artist": ["Solo Artist"],
    "media": [
      {
        "sideDimension": 640,
        "url": "https://i.scdn.co/image/xyz789"
      }
    ]
  }
]


/api/profile
{
  "error": false,
  "payload": {
    "name": "User Name",
    "email": "user@example.com",
    "picture": "https://example.com/picture.jpg"
  }
}

/api/live
[
  {
    "id": "67890",
    "title": "Another Song",
    "upvotes": 17,
    "upvoted": false,
    "artist": ["Solo Artist"],
    "media": [
      {
        "sideDimension": 640,
        "url": "https://i.scdn.co/image/xyz789"
      }
    ]
  }
]
