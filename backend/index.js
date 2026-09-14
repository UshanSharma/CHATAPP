import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import model from "./lib/gemini.js";

const port = process.env.PORT || 3000;
const app = express();

// ---------------- FILE PATH ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- MIDDLEWARE ----------------
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// ---------------- IMAGEKIT ----------------
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// ---------------- CHAT (GEMINI) ----------------
app.post("/api/chat", ClerkExpressRequireAuth(), async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required!" });
  }

  try {
    const lastMessage = messages[messages.length - 1];
    const lastText =
      typeof lastMessage.parts[0] === "string"
        ? lastMessage.parts[0]
        : lastMessage.parts[0].text;

    const chatHistory = messages.slice(0, -1).map((msg) => {
      const msgText =
        typeof msg.parts[0] === "string" ? msg.parts[0] : msg.parts[0].text;
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msgText }],
      };
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(lastText);
    const answer = result.response.text();

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to get AI response" });
  }
});

// ---------------- ROUTES ----------------
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();
    const userChats = await UserChats.find({ userId });

    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId,
        chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId },
        { $push: { chats: { _id: savedChat._id, title: text.substring(0, 40) } } }
      );
    }

    res.status(201).send(savedChat._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const userChats = await UserChats.find({ userId });
    res.status(200).send(userChats[0]?.chats || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching userchats!");
  }
});

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding conversation!");
  }
});

// ---------------- STATIC (PRODUCTION) ----------------
app.use(express.static(path.join(__dirname, "../client/dist")));

// ✅ Only serve index.html for non-API routes
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// ---------------- DB + SERVER START ----------------
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("MongoDB connected");

    const server = app.listen(port, () => {
      console.log("Server running on port", port);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${port} is already in use. Kill the process or change the PORT in .env`
        );
        process.exit(1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();