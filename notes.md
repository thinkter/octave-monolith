when the client first comes check if their localstorage is empty and check if their localstorage token is expired o
if either is true call the /getToken 






Octave Music Queue System - Comprehensive Technical Report
Project Overview
Octave is a collaborative music queue system developed by ACM VIT. It allows users to request songs, upvote songs they like, and automatically plays the top-rated songs first. The application uses a client-server architecture with a React frontend and a remote backend API.

Frontend Architecture
Technology Stack
Framework: React (v16.12.0)
Routing: React Router (v5.1.2)
HTTP Client: Axios (v0.21.1)
CSS Framework: Tailwind CSS (v1.2.0)
Animation: GSAP (GreenSock Animation Platform v3.2.4)
Build System: Create React App (React Scripts 3.4.0)
Component Structure
The application follows a component-based architecture with a clear separation of concerns:

App.jsx: Root component that sets up routing between Landing and Main pages

Pages:

LandingPage.jsx: Entry point for users, provides information about the app and login options
MainPage.jsx: Main application interface showing now playing and queue sections
Components:

Landing Components:
LandingHeader, LandingGrid, OctaveInfo, Divider, GoogleButton
Main Components:
Navbar: Navigation bar with logout functionality
PlayingSection: Displays currently playing song
QueueSection: Shows song queue and search functionality
SongCards/SongCard: Displays individual songs with upvote functionality
SearchBox: Allows users to search for new songs
Icons and Assets:

SVG icons for heart (liked/unliked), add, and rating
Custom logos for C2C and Octave
Authentication Flow
User clicks the Google Sign-in button on LandingPage
OAuth authentication window opens to http://login-authentication-app.herokuapp.com/auth
Upon successful authentication, a token is received via window message
Token is stored in localStorage for subsequent API requests
User is redirected to the main application page
Backend Integration
API Communication
The application communicates with a backend API hosted at https://acmoctave.azurewebsites.net using Axios for HTTP requests. The API endpoints include:

Authentication:

Token-based authentication (JWT)
Tokens stored in localStorage
All API requests include Authorization header with Bearer token
API Endpoints (from requests.js):

/api/leaderboard: GET - Retrieves the song queue sorted by upvotes
/api/profile: GET - Fetches user profile information
/api/live: GET - Gets currently playing song
/api/search: POST - Searches for songs by query string
/api/request: POST - Adds a song to the queue
/api/upvote: POST - Upvotes a song in the queue
Data Flow
Initial Load:

MainPage component fetches queue, user profile, and now playing song on mount
Sets up interval to poll for updates every 10 seconds
Search Functionality:

User enters search query in SearchBox
On submission, app calls /api/search endpoint
Search results displayed for user to add to queue
Song Management:

Adding Songs: User can add songs from search results
Upvoting: Users can upvote songs they like
Queue Management: Songs are sorted by upvote count
State Management
React component state is used for local state management
Parent components (MainPage) pass data and callbacks to child components
Poll-based updates refresh the UI every 10 seconds
UI/UX Features
Responsive Design
Tailwind CSS for responsive layouts
Custom breakpoints defined in tailwind.config.js (sm: 870px, md: 1140px, lg: 1600px)
Dynamic component sizing based on window width
Animations
GSAP animations for smooth transitions and effects
Fade and slide animations for element entry
User Interface
Landing Page:

Information about app features
Google authentication button
Animated transitions
Main Page:

Now Playing section with current song
Queue section showing upcoming songs
Search functionality to add new songs
Upvote functionality with heart icons
Deployment Configuration
Configured for GitHub Pages deployment
Custom domain setup (octave.acmvit.in)
Production build optimizations with PurgeCSS for Tailwind
Technical Details
Code Organization
Component-based architecture
Separation of concerns (UI, data fetching, routing)
Consistent prop validation with PropTypes
Build Process
CSS processing with PostCSS and Tailwind
Production optimizations with PurgeCSS
Static asset hosting on GitHub Pages
Conclusion
Octave is a well-structured React application that provides collaborative music queue management. It demonstrates effective frontend-backend integration using RESTful APIs, JWT authentication, and real-time updates through polling. The UI is responsive and modern, with smooth animations and intuitive interactions.

The application successfully implements its core features:

User authentication via Google OAuth
Song search and addition to queue
Upvoting functionality
Automatic queue sorting by popularity
Real-time updates of now playing and queue status
This architecture allows for scalability and maintainability while providing a seamless user experience.
