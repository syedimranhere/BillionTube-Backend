import { like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { dislike } from "../models/dislike.model.js";
import { video } from "../models/video.model.js";
const togglelikeVideo = asyncHandler(async (req, res) => {
  const videoID = req.params.videoId;

  // Find the video first
  const VIDEO = await video.findById(videoID);
  if (!VIDEO) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  // Check if already liked by user
  const existingLike = await like.findOne({
    video: videoID,
    likedBy: req.user,
  });

  if (existingLike) {
    // Unlike
    VIDEO.likes = Math.max(0, VIDEO.likes - 1); // avoid negative count
    await VIDEO.save();

    await like.findOneAndDelete({
      video: videoID,
      likedBy: req.user,
    });

    return res.status(201).json({
      success: true,
      liked: false,
    });
  }

  // Remove any existing dislike (can't have both)
  await dislike.findOneAndDelete({
    video: videoID,
    dislikedBy: req.user,
  });
  // Like the video
  VIDEO.likes += 1;
  await VIDEO.save();

  await like.create({
    video: videoID,
    likedBy: req.user,
    likedTo: VIDEO.owner,
  });

  return res.status(201).json({
    success: true,
    liked: true,
  });
});

const toggledislikeVideo = asyncHandler(async (req, res) => {
  const videoID = req.params.videoId;

  // Check if already disliked → remove dislike
  const existingDislike = await dislike.findOne({
    video: videoID,
    dislikedBy: req.user,
  });
  if (existingDislike) {
    await dislike.findOneAndDelete({ video: videoID, dislikedBy: req.user });
    return res.status(200).json({
      success: true,
      disliked: false,
    });
  }
  //the likes are getting in minus toh ham ye use kreng
  await video.findByIdAndUpdate(
    videoID,
    [
      {
        $set: {
          likes: {
            $cond: [
              { $gt: ["$likes", 0] }, // if likes > 0
              { $subtract: ["$likes", 1] }, // then decrement
              0, // else keep at 0
            ],
          },
        },
      },
    ],
    { new: true }
  );

  await like.findOneAndDelete({ video: videoID, likedBy: req.user });
  await dislike.create({ video: videoID, dislikedBy: req.user });

  return res.status(200).json({
    success: true,
    disliked: true,
  });
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const getLikedVideos = await like
    .find({
      likedBy: req.user,
    })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "fullname avatar",
      },
    });

  return res.status(200).json({
    success: true,
    data: getLikedVideos,
  });
});
const getLikedStatus = asyncHandler(async (req, res) => {
  //we will fetch this on reload takay my default user ko pata rhey usne kia like kara tha ya dislike
  const { videoId } = req.params;

  const likedStatus = await like.findOne({
    video: videoId,
    likedBy: req.user,
  });
  const dislikelikedStatus = await dislike.findOne({
    video: videoId,
    dislikedBy: req.user,
  });

  if (likedStatus) {
    return res.status(200).json({
      success: true,
      status: "liked",
    });
  }
  if (dislikelikedStatus) {
    return res.status(200).json({
      success: true,
      status: "disliked",
    });
  }
  //it means the video was liked

  return res.status(200).json({ success: true, status: "NONE" });
});

const deleteforAll = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  await like.deleteMany({ video: videoId });
  await dislike.deleteMany({ video: videoId });

  return res.status(200).json({
    success: true,
    message: "Likes and dislikes deleted",
  });
});

export {
  deleteforAll,
  togglelikeVideo,
  getLikedVideos,
  toggledislikeVideo,
  getLikedStatus,
};
