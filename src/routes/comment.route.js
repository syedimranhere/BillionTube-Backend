import { Router } from "express";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";

const commentRoute = Router();

// router.use(isAuthenticated)  // Apply isAuthenticated middleware to all routes in this file
commentRoute.use(isAuthenticated);

//get here is getting our req.params updated
// : below here tells that there is a param
commentRoute
  .route("/:videoId")
  .post(isAuthenticated)
  .post(addComment)
  .get(getVideoComments);

//below we need CommentID
commentRoute.route("/c/:commentId").delete(deleteComment).patch(updateComment);
export default commentRoute;
