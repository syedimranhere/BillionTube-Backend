import { watchhistory } from "../models/watchhistory.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const addToWatchHistory = asyncHandler(async (req, res) => {
  console.log("added called history");
  const userId = req.user;
  const videoId = req.params.videoId;
  await watchhistory.findOneAndUpdate(
    { user: userId, video: videoId },
    { $set: { lastWatchedAt: new Date() } },
    { upsert: true, new: true } // upsert if not exists, new if exists
  );

  return res.status(200).json({
    success: true,
    message: "Video added to watch history",
  });
});
export const deleteAvideofromWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user;
  const videoId = req.params.videoId;
  await watchhistory.findOneAndDelete({ user: userId, video: videoId });
  return res.status(200).json({
    success: true,
    message: "Video deleted from watch history",
  });
});

export const deleteEntireWatchhistory = asyncHandler(async (req, res) => {
  const userId = req.user;

  await watchhistory.deleteMany({ user: userId });
  return res.status(200).json({
    success: true,
    message: "Watch history deleted",
  });
});

export const getEntireWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user;

  const watchHistory = await watchhistory
    .find({ user: userId })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        model: "user",
        // select: "username avatar",
      },
    })
    .sort({ lastWatchedAt: -1 })
    .select("-_id");

  return res.status(200).json({
    success: true,
    data: watchHistory,
  });
});

export const Deleteforall = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  await watchhistory.deleteMany({ video: videoId });
  return res.status(200).json({
    success: true,
    message: "Video deleted from watch history",
  });
});
