Technical Report: Octave Backend
Overview
Octave is a backend service designed to manage music in events based on public reviews and voting. It integrates with Spotify's API for music playback and uses Google OAuth for user authentication. The application allows participants to search for tracks, request songs, upvote songs, and automatically queues the most popular songs to play during events.

Architecture
Core Components
Express.js Server: The main application server handling all HTTP requests.
MongoDB Database: Stores user data, track information, and authentication tokens.
Spotify Integration: Handles music search, playback, and playlist management.
Google OAuth: Manages user authentication and authorization.
API Routes: Various endpoints for interacting with the application.
File Structure and Functionality
Main Application (app.js)
Initializes the Express.js application
Connects to the MongoDB database
Sets up middleware (bodyparser, CORS)
Loads and configures route handlers
Implements token refresh mechanism for Spotify
Starts the server on the specified port
Database Models (bin/database/*.schema.js)
TokenStorage Schema (tokens.schema.js)

Stores Spotify access and refresh tokens
Used for persisting authentication across server restarts
Track Schema (track.schema.js)

Stores track information (ID, title, artists, media, etc.)
Tracks the playing status and upvotes
Maintains lists of users who have upvoted each track
ExternalParticipant Schema (externalParticipant.schema.js)

Stores data for non-VIT participants (external users)
Includes Google authentication information
Stores profile data (name, email, picture, etc.)
InternalParticipant Schema (internalParticipant.schema.js)

Stores data for VIT participants (internal users)
Similar to ExternalParticipant but with additional fields like registration number and hostel room
Utility Modules
Spotify Integration (bin/spotify/spotify.js)

Manages Spotify authentication (OAuth flow)
Provides methods for track search, playlist management
Processes and filters track data
Handles player status tracking and song queueing
Google Integration (bin/google/google.js)

Manages Google OAuth authentication
Handles token generation and verification
Provides utility methods for email validation
Manages JWT for user sessions
Logger (bin/logger/logger.js)

Configures Winston logger for consistent logging
Used throughout the application for debugging and monitoring
API Routes
API Routes (routes/apiRoutes.js)

Handles core application functionality
Implements authentication middleware
Endpoints:
/api/search: Searches for tracks via Spotify
/api/upvote: Allows users to upvote tracks
/api/request: Adds tracks to the leaderboard
/api/leaderBoard: Returns the current track leaderboard
/api/live: Shows currently playing track information
/api/profile: Returns the user's profile information
Google Routes (routes/googleRoutes.js)

Manages user authentication flow
Handles OAuth callbacks
Differentiates between internal (VIT) and external users
Creates new user accounts or retrieves existing ones
Generates JWT tokens for authenticated users
Spotify Routes (routes/spotifyRoutes.js)

Manages Spotify authentication flow
Handles token refreshing and management
Provides endpoints for track search and player control
Implements automatic song queueing based on upvotes
Handles background process for track monitoring and playlist management
Landing Page Routes (routes/landingPageRoutes.js)

Simple welcome message for the API root endpoint
Admin Routes (routes/adminRouts.js)

Protected routes for administrative functions
Allows deletion of tracks from the leaderboard
Key Workflows
Authentication Flow
Users are directed to /google/signIn with a type parameter (internal/external)
They are redirected to Google's OAuth consent screen
After authentication, Google redirects to the callback URL
The server verifies the user data and creates/retrieves user records
A JWT token is generated and returned to the frontend
This token is used for subsequent API requests
Track Request and Upvoting Flow
Users search for tracks using /api/search endpoint
They can request a track via /api/request
The track is added to the leaderboard with an initial upvote
Other users can upvote tracks using /api/upvote
The leaderboard is sorted by number of upvotes
Automatic Playback Flow
A background process runs every 10 seconds checking the current player status
When a song is about to end (within 11 seconds), the system:
Marks the current track as played
Finds the highest-upvoted unplayed track
Adds it to the Spotify playlist
Updates the track status in the database
Spotify Token Management
On server startup, tokens are loaded from the database
If no tokens exist, the OAuth flow is initiated
Tokens are refreshed automatically every 40 minutes
New tokens are stored in both memory and the database
Security Measures
JWT-based authentication for API requests
Domain validation for VIT emails
User separation between internal and external participants
Protection of admin routes through environment variables
Secure token storage and management
System Requirements
Node.js runtime
MongoDB database
Spotify Developer account and credentials
Google Developer account and credentials
Internet connectivity for API communication
Environment Configuration
The application requires the following environment variables:

SPOTIFY_CLIENT_ID: Spotify application client ID
SPOTIFY_CLIENT_SECRET: Spotify application client secret
SPOTIFY_REDIRECT: Callback URL for Spotify OAuth
TRACK_RETURN_LIMIT: Number of tracks to return in search results
GOOGLE_CLIENT_ID: Google application client ID
GOOGLE_CLIENT_SECRET: Google application client secret
GOOGLE_CALLBACK: Callback URL for Google OAuth
JWT_SECRET: Secret key for JWT token generation/verification
DB_CONNECTION_STRING: MongoDB connection string
ADMIN_ROUTE: Custom route name for admin endpoints
FLUSH_ROUTE: Route name for flushing tokens
SPOTIFY_PLAYLIST: ID of the Spotify playlist to use
Conclusion
Octave is a sophisticated backend system that leverages Spotify and Google APIs to create an interactive music request and playback system. It employs modern authentication mechanisms, real-time monitoring, and automated playlist management to provide a seamless music experience for events.

The codebase follows a modular structure with clear separation of concerns between authentication, data management, and API functionality. The use of middleware for authentication and logging provides consistent behavior across endpoints, while background processes ensure continuous operation without manual intervention.
