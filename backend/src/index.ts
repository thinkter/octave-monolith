import express, { Request, Response } from "express";
import { db } from "./firebase_admin";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const app = express();
const PORT = 3000;
app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Hello from TypeScript + Express!");
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
