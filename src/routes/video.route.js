import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideosForPage,
  getAUsersvideo,
  getTrendingVideos,
  getSearchedVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getUserId } from "../middlewares/getuserid.js";

const videoRoute = Router();
videoRoute.get("/search", getSearchedVideos);
videoRoute.get("/trending", getTrendingVideos);
videoRoute.get("/uservideo/:userId", getAUsersvideo);
videoRoute.get("/getVideos", getVideosForPage);
videoRoute.get("/:videoId", getUserId, getVideoById);
videoRoute.use(isAuthenticated);

videoRoute
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  );

videoRoute
  .route("/:videoId")
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

videoRoute.patch("/toggle/publish/:videoId", togglePublishStatus);

export { videoRoute };
