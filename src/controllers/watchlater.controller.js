import { watchlater } from "../models/watchlater.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

// import { user } from "../models/user.model";
const getWatchLatervideos = asyncHandler(async (req, res) => {
  const userId = req.user;
  const userwatchlater = await watchlater
    .findOne({
      user: userId,
    })
    .populate({
      path: "videos",
      populate: {
        path: "owner",
        select: "fullname avatar _id",
      },
    })

    .select("-_id videos");
  console.log(userwatchlater);
  return res.status(200).json({
    success: true,
    data: userwatchlater,
  });
});
const addVideoinWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user;

  let watchLaterDoc = await watchlater.findOne({ user: userId });

  if (!watchLaterDoc) {
    // create a new one if not fox`und
    watchLaterDoc = await watchlater.create({
      user: userId,
      videos: [videoId],
    });
  } else {
    // only push if not already there
    if (!watchLaterDoc.videos.includes(videoId)) {
      watchLaterDoc.videos.push(videoId);
      await watchLaterDoc.save();
    } else {
      return res.status(200).json({
        success: false,
        message: "Video already in watch later",
      });
    }
  }

  console.log(watchLaterDoc);
  return res.status(200).json({
    success: true,
    message: "Video added to watch later",
  });
});

const removeVideoinWatchLater = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user;
  const WatchHistory = await watchlater.findOneAndUpdate(
    {
      user: userId,
    },
    { $pull: { videos: videoId } }
  );
  res.status(200).json({
    success: true,
    message: "Video removed from watch later",
  });
});
export { addVideoinWatchLater, removeVideoinWatchLater, getWatchLatervideos };
