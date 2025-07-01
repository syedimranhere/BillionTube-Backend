import { Router } from "express";
import {
     likeVideo,
     likeComment,
     likeTweet,
     getLikedVideos,
} from "../controllers/like.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
const likeRoute = Router();
likeRoute.use(isAuthenticated); //all routes are protected

likeRoute.route("/toggle/v/:videoId").post(likeVideo);
likeRoute.route("/toggle/c/:commentId").post(likeComment);
likeRoute.route("/toggle/t/:tweetId").post(likeTweet);
likeRoute.route("/videos").get(getLikedVideos);

export {likeRoute}