// cleanup-empty-answers.js
// One-off script to remove chat history entries where role === "model"
// and the answer text is an empty string ("").
//
// USAGE:
//   1. Place this file in your backend folder (same place as your other scripts)
//   2. Make sure your .env has MONGO=<your connection string>
//   3. Run: node cleanup-empty-answers.js
//
// This uses $pull to remove only the matching sub-documents from the
// "history" array — it does NOT delete the whole chat, just the empty
// model messages inside it.

import "dotenv/config";
import mongoose from "mongoose";
import Chat from "./models/chat.js"; // adjust path if needed

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      tlsAllowInvalidCertificates: true,
    });
    console.log("Connected to MongoDB");

    // Find how many chats would be affected first (dry-run count)
    const affected = await Chat.countDocuments({
      history: {
        $elemMatch: { role: "model", "parts.0.text": "" },
      },
    });
    console.log(`Chats containing at least one empty model answer: ${affected}`);

    if (affected === 0) {
      console.log("Nothing to clean up. Exiting.");
      process.exit(0);
    }

    // Remove only the empty model entries from each chat's history array
    const result = await Chat.updateMany(
      {},
      {
        $pull: {
          history: { role: "model", "parts.0.text": "" },
        },
      }
    );

    console.log("Cleanup complete.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
};

run();
