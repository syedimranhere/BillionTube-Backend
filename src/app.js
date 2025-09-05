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
import { videoRoute } from "./routes/video.route.js";
import { playlistRoute } from "./routes/playlist.route.js";
import { subscriptionRouter } from "./routes/subscription.route.js";
import { watchlaterRoute } from "./routes/watchlater.route.js";
import { watchHistoryRouter } from "./routes/watchhistory.route.js";
app.use("/api/user", userRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/likes", likeRoute);
app.use("/api/videos", videoRoute);
app.use("/api/playlists", playlistRoute);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/watchlater", watchlaterRoute);
app.use("/api/watchhistory", watchHistoryRouter);

export { app };
