import express, { Request, Response } from "express";
import { db } from "./firebase_admin";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Configure middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// Spotify API configuration
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
// const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/spotify-callback";
const REDIRECT_URI = "http://localhost:5000/spotify-callback";
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-read-playback-state"
].join(" ");

// Spotify token management
let _ACCESS_TOKEN: string | null = null;
let _TOKEN_EXPIRES_AT = 0;

// User token storage
let userAccessToken: string | null = null;
let userRefreshToken: string | null = null;
let tokenExpiresAt = 0;

// Existing routes for track management
app.post("/upvote/:trackId", async (req: Request, res: Response) => {
  const { trackId } = req.params;
  const userId = (req as any).userId || "userId1";

  try {
    const trackRef = db.collection("tracks").doc(trackId);
    const upvoterRef = trackRef.collection("upvoters").doc(userId);

    const result = await db.runTransaction(async (transaction) => {
      const [trackDoc, upvoterDoc] = await Promise.all([
        transaction.get(trackRef),
        transaction.get(upvoterRef),
      ]);

      if (!trackDoc.exists) {
        throw new Error("Track does not exist");
      }

      if (upvoterDoc.exists) {
        transaction.delete(upvoterRef);
        transaction.update(trackRef, {
          upvotes: admin.firestore.FieldValue.increment(-1),
        });

        return { success: true, action: "removed" };
      } else {
        transaction.set(upvoterRef, {
          userId,
          createdAt: admin.firestore.Timestamp.now(),
        });
        transaction.update(trackRef, {
          upvotes: admin.firestore.FieldValue.increment(1),
        });

        return { success: true, action: "added" };
      }
    });
    return res.json(result);
  } catch (err: any) {
    console.error("Toggle upvote error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/tracks", async (req: Request, res: Response) => {
  try {
    const { trackId, title, length, explicit, url, popularity, media, artists } = req.body;

    if (!trackId || !title || !url) {
      return res.status(400).json({ error: "trackId, title, and url are required" });
    }

    const trackRef = db.collection("tracks").doc(trackId);

    const result = await db.runTransaction(async (transaction) => {
      const trackDoc = await transaction.get(trackRef);

      if (trackDoc.exists) {
        transaction.update(trackRef, { updatedAt: Timestamp.now() });
        return { alreadyExists: true, trackId: trackRef.id };
      } else {
        const now = Timestamp.now();
        transaction.set(trackRef, {
          title,
          length,
          playing: false,
          played: false,
          explicit: explicit || false,
          url,
          popularity: popularity || 0,
          upvotes: 0,
          createdAt: now,
          updatedAt: now,
        });

        if (Array.isArray(media)) {
          media.forEach((m: any, index: number) => {
            transaction.set(trackRef.collection("media").doc(`media_${index}`), {
              height: m.height,
              width: m.width,
              url: m.url,
            });
          });
        }

        if (Array.isArray(artists)) {
          artists.forEach((a: any, index: number) => {
            transaction.set(trackRef.collection("artists").doc(`artist_${index}`), {
              name: a.name,
            });
          });
        }
        return { alreadyExists: false, trackId: trackRef.id };
      }
    });
    return res.json({
      success: true,
      ...result,
      message: result.alreadyExists
        ? "Track already exists, updated timestamp"
        : "Track added successfully",
    });
  } catch (err: any) {
    console.error("Error adding track:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/tracks/:trackId", async (req: Request, res: Response) => {
  const { trackId } = req.params;

  if (!trackId) return res.status(400).json({ error: "trackId is required" });

  const trackRef = db.collection("tracks").doc(trackId);

  try {
    const trackDoc = await trackRef.get();
    if (!trackDoc.exists) {
      return res.status(404).json({ error: "Track not found" });
    }

    await admin.firestore().recursiveDelete(trackRef);

    return res.json({
      success: true,
      trackId,
      message: "Track and all subcollections deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting track:", err);
    return res.status(500).json({ error: err.message });
  }
});

async function getUser(userId: string) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  return { id: userDoc.id, ...userDoc.data() };
}

app.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await getUser(userId);
    return res.json({ user });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});


app.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const tracksSnapshot = await db
      .collection("tracks")
      .orderBy("upvotes", "asc")
      .orderBy("createdAt", "asc")
      .get();

    const tracks = tracksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ tracks });
  } catch (err: any) {
    console.error("Leaderboard fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Spotify API helper functions
async function getAccessToken(): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (_ACCESS_TOKEN && now < _TOKEN_EXPIRES_AT - 30) {
    return _ACCESS_TOKEN;
  }

  const authStr = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const b64AuthStr = Buffer.from(authStr).toString("base64");

  try {
    const resp = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${b64AuthStr}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    const body = resp.data;
    const token = body.access_token;
    const expiresIn = body.expires_in || 3600;
    _ACCESS_TOKEN = token;
    _TOKEN_EXPIRES_AT = Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10);
    return _ACCESS_TOKEN;
  } catch (err: any) {
    console.error("Failed to fetch token:", err.response ? err.response.data : err.message);
    return null;
  }
}

function ensureMediaThree(images: any[]): Array<{height: number, url: string}> {
  if (!images || images.length === 0) {
    return [
      { height: 0, url: "" },
      { height: 0, url: "" },
      { height: 0, url: "" },
    ];
  }

  const normalized = images
    .map((img) => ({
      height: img.height || 0,
      url: img.url || "",
    }))
    .sort((a, b) => b.height - a.height);

  while (normalized.length < 3) {
    normalized.push({ ...normalized[normalized.length - 1] });
  }

  return normalized;
}

// New Spotify API endpoints
app.get("/search", async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter ?q=" });
  }

  const token = await getAccessToken();
  if (!token) {
    return res.status(500).json({ error: "Failed to acquire Spotify access token" });
  }

  const headers = { Authorization: `Bearer ${token}` };
  const params = { q: query, type: "track", limit: 10 };

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers,
      params,
      timeout: 10000,
    });

    const items = response.data.tracks?.items || [];
    const result = items.map((track: any) => {
      const albumImages = track.album?.images || [];
      const media = ensureMediaThree(albumImages);

      return {
        id: track.id || "",
        name: track.name || "",
        artist: Array.isArray(track.artists)
          ? track.artists.map((a: any) => a.name || "")
          : [],
        explicit: !!track.explicit,
        popularity: track.popularity || 0,
        media,
        url: `https://open.spotify.com/track/${track.id || ""}`,
        length: track.duration_ms || 0,
      };
    });

    return res.json(result);
  } catch (err: any) {
    if (err.response) {
      console.error("Spotify returned", err.response.status, err.response.data);
      return res.status(err.response.status).json({ error: err.response.data });
    }
    console.error("Network error contacting Spotify:", err.message);
    return res.status(502).json({ error: "Network error contacting Spotify" });
  }
});

app.get("/spotify-login", (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2, 15);
  
  res.cookie("spotify_auth_state", state, { httpOnly: true });
  
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("client_id", CLIENT_ID);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("scope", SPOTIFY_SCOPES);
  
  res.redirect(authUrl.toString());
});

app.get("/spotify-callback", async (req: Request, res: Response) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies.spotify_auth_state : null;
  
  if (state === null || state !== storedState) {
    return res.redirect("/#/error/state_mismatch");
  }
  
  res.clearCookie("spotify_auth_state");
  
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code as string,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      }).toString(),
      {
        headers: {
          "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    userAccessToken = access_token;
    userRefreshToken = refresh_token;
    tokenExpiresAt = Date.now() + (expires_in * 1000);
    
    res.cookie("spotify_auth", "true", { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    
    res.redirect(`http://localhost:3000/auth-success`);
    
  } catch (error: any) {
    console.error("Error during token exchange:", error.message);
    res.redirect("http://localhost:3000/auth-error");
  }
});

app.get("/spotify-refreshtoken", async (req: Request, res: Response) => {
  if (!userRefreshToken) {
    return res.status(401).json({ error: "No refresh token available", login_url: "/spotify-login" });
  }
  
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: userRefreshToken
      }).toString(),
      {
        headers: {
          "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    const { access_token, expires_in, refresh_token } = response.data;
    
    userAccessToken = access_token;
    tokenExpiresAt = Date.now() + (expires_in * 1000);
    if (refresh_token) {
      userRefreshToken = refresh_token;
    }
    
    return res.json({ success: true });
    
  } catch (error: any) {
    console.error("Error refreshing token:", error.message);
    return res.status(500).json({ error: "Failed to refresh token" });
  }
});

app.get("/live", async (req: Request, res: Response) => {
  if (!userAccessToken) {
    return res.status(401).json({ error: "Authentication required", login_url: "/spotify-login" });
  }
  
  if (Date.now() >= tokenExpiresAt - 30000) { // 30 seconds buffer
    if (!userRefreshToken) {
      return res.status(401).json({ error: "Session expired", login_url: "/spotify-login" });
    }
    
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: userRefreshToken
        }).toString(),
        {
        headers: {
          "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
      );
      
      const { access_token, expires_in, refresh_token } = response.data;
      
      userAccessToken = access_token;
      tokenExpiresAt = Date.now() + (expires_in * 1000);
      if (refresh_token) {
        userRefreshToken = refresh_token;
      }
      
    } catch (error: any) {
      console.error("Error refreshing token:", error.message);
      return res.status(401).json({ error: "Session expired", login_url: "/spotify-login" });
    }
  }
  
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        "Authorization": `Bearer ${userAccessToken}`
      }
    });
    
    if (response.status === 204 || !response.data || !response.data.item) {
      return res.json([]);
    }
     
    const track = response.data.item;
    const albumImages = track.album?.images || [];
    const media = ensureMediaThree(albumImages);
    
    const result = {
      id: track.id || "",
      name: track.name || "",
      artist: Array.isArray(track.artists)
        ? track.artists.map((a: any) => a.name || "")
        : [],
      explicit: !!track.explicit,
      popularity: track.popularity || 0,
      media,
      url: `https://open.spotify.com/track/${track.id || ""}`,
      length: track.duration_ms || 0,
      now_playing: true,
      isPlaying: response.data.is_playing
    };
    
    return res.json([result]);
    
  } catch (error: any) {
    console.error("Error fetching currently playing:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Session expired", login_url: "/spotify-login" });
    }
    
    return res.status(500).json({ error: "Failed to fetch currently playing track" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from TypeScript + Express!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
