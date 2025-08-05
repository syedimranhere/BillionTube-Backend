import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "5000kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the API",
  });
});

// Routes
import userRoute from "./routes/user.route.js";
import commentsRoute from "./routes/comment.route.js";
import { likeRoute } from "./routes/likes.route.js";
import { tweetRoute } from "./routes/tweet.route.js";
import { videoRoute } from "./routes/video.route.js";
import { playlistRoute } from "./routes/playlist.route.js";
import { subscriptionRouter } from "./routes/subscription.route.js";

app.use("/api/v1/user", userRoute);
app.use("/api/v1/comments", commentsRoute);
app.use("/api/v1/likes", likeRoute);
app.use("/api/v1/tweets", tweetRoute);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/playlists", playlistRoute);
app.use("/api/v1/subscriptions", subscriptionRouter);

export { app };
