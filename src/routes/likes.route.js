import { Router } from "express";
import {
  togglelikeVideo,
  getLikedVideos,
  getLikedStatus,
  deleteforAll,
  toggledislikeVideo,
} from "../controllers/like.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
const likeRoute = Router();

likeRoute.use(isAuthenticated); //all routes are protected
likeRoute.route("/delete-for-all/:videoId").delete(deleteforAll);
likeRoute.route("/v/l/:videoId").post(togglelikeVideo);
likeRoute.route("/v/d/:videoId").post(toggledislikeVideo);

likeRoute.route("/videos").get(getLikedVideos);
likeRoute.route("/status/:videoId").get(getLikedStatus);

export { likeRoute };
