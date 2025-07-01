import { Apierror } from "../utils/api.error.js";
import { like } from "../models/like.model.js";
import { user } from "../models/user.model.js";
import { video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { comment } from "../models/comment.model.js";

// like on comment , like on tweet , like on video and get all liked videos

const likeVideo = asyncHandler(async (req, res) => {
     const videoID = req.params.videoId;

     const likeRecord = await like.create({
          //other 2 will remain undefined we didn't use em
          video: videoID,
          likedBy: req.user,
     });

     return res.status(200).json({
          success: true,
          message: "Video Liked",
     });
});

const likeComment = asyncHandler(async (req, res) => {
     const commentID = req.params.commentId;

     const likeRecord = await like.create({
          //other 2 will remain undefined we didn't use em
          comment: commentID,
          likedBy: req.user,
     });

     return res.status(200).json({
          success: true,
          message: "Comment Liked",
     });
});
const likeTweet = asyncHandler(async (req, res) => {
     const tweetID = req.params.tweetId;

     const likeRecord = await like.create({
          //other 2 will remain undefined we didn't use em
          tweet: tweetID,
          likedBy: req.user,
     });

     return res.status(200).json({
          success: true,
          message: "Tweet Liked",
     });
});
const getLikedVideos = asyncHandler(async (req, res) => {
     //find all vidoes this user Liked

     const getLikedVideos = await like
          .find({
               likedBy: req.user,
               video: { $exists: true },
          })
          .select("video -_id");

     return res.status(200).json({
          success: true,
          data: getLikedVideos,
       
     });
});

export { likeVideo, likeComment, likeTweet, getLikedVideos };
