import { db } from "./firebase_admin"; // your initialized Firestore admin instance
import { Timestamp } from "firebase-admin/firestore";

async function seed() {
  try {
    const now = Timestamp.now();

    // 1. Users
    await db.collection("users").doc("userId1").set({
      googleID: "google-123",
      name: "Alice Doe",
      phoneNumber: "+1234567890",
      email: "alice@example.com",
      refreshToken: "refresh_token_value",
      picture: "https://example.com/pic.jpg",
      createdAt: now,
      updatedAt: now,
    });

    // 2. Token Storage
    await db.collection("tokenStorage").doc("tokenId1").set({
      accessToken: "access_token_value",
      refreshToken: "refresh_token_value",
      createdAt: now,
      updatedAt: now,
    });

    // 3. Tracks
    await db.collection("tracks").doc("trackId1").set({
      title: "Song A",
      length: 180,
      playing: false,
      played: false,
      explicit: false,
      url: "https://open.spotify.com/track/xyz",
      popularity: 75,
      upvotes: 3,
      createdAt: now,
      updatedAt: now,
    });

    // 4a. Track Media
    await db
      .collection("tracks")
      .doc("trackId1")
      .collection("media")
      .doc("mediaId1")
      .set({
        height: 640,
        width: 640,
        url: "https://example.com/album-cover.jpg",
      });

    // 4b. Track Artists
    await db
      .collection("tracks")
      .doc("trackId1")
      .collection("artists")
      .doc("artistId1")
      .set({
        name: "Artist One",
      });

    // 4c. Track Upvoters
    await db
      .collection("tracks")
      .doc("trackId1")
      .collection("upvoters")
      .doc("upvoterId1")
      .set({
        userId: "userId1",
      });

    console.log("✅ Firestore seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
  }
}

seed();
