import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import {
     getAllVideos,
     publishAVideo,
     getVideoById,
     updateVideo,
     deleteVideo,
     togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const videoRoute = Router();
videoRoute.use(isAuthenticated);
videoRoute
     .route("/")
     .get(getAllVideos)
     .post(
          //this entire thing is handle by multer ( send it to public temp first )
          upload.fields([
               {
                    name: "videoFile",
                    maxCount: 1,
               },
               {
                    name: "thumbnail",
                    maxCount: 1,
               },
          ]),
          publishAVideo
     );

videoRoute
     .route("/:videoId")
     .get(getVideoById)
     .delete(deleteVideo)
     .patch(upload.single("thumbnail"), updateVideo);

videoRoute.route("/toggle/publish/:videoId").patch(togglePublishStatus);

videoRoute.use(isAuthenticated);

export { videoRoute };
