import { Apierror } from "../utils/api.error.js";
import { like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const likeVideo = asyncHandler(async (req, res) => {
  const videoID = req.params.videoId;

  await like.create({
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

  await like.create({
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

  await like.create({
    tweet: tweetID,
    likedBy: req.user,
  });

  return res.status(200).json({
    success: true,
    message: "Tweet Liked",
  });
});

const getLikedVideos = asyncHandler(async (req, res) => {
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
