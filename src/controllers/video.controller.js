import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { video } from "../models/video.model.js";
import { uploadimages, uploadvideo } from "../utils/cloudinary.js";
import { user } from "../models/user.model.js";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const sortfield = sortBy || "createdAt";
  const sortOrder = sortType === "asc" ? 1 : -1;

  const videos = await video.find({}).sort({ [sortfield]: sortOrder });

  return res.status(200).json({
    success: true,
    data: videos,
  });
});
export const getAUsersvideo = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const videos = await video
    .find({ owner: userId, visibility: "public" })
    .sort({ uploadDate: -1 });
  return res.status(200).json({
    success: true,
    data: videos,
    len: videos.length,
  });
});

export const getVideosForPage = asyncHandler(async (req, res) => {
  try {
    const videos = await video.aggregate([
      { $match: { visibility: "public" } }, // only published
      { $sample: { size: 20 } }, // random 20 docs
      {
        //take out the owners from there
        $lookup: {
          from: "users", // collection name of owners
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" }, // flatten owner array
      {
        $project: {
          // exclude sensitive fields
          "owner.password": 0,
          "owner.refreshtoken": 0,
          "owner.totalViews": 0,
          "owner.isVerified": 0,
          "owner.category": 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Error fetching homepage videos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching homepage videos",
    });
  }
});
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}.${formattedSeconds}`;
}
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, category, tags, visibility } = req.body;

  if (!title) {
    throw new Apierror(400, "Title is required");
  }
  const { videoFile, thumbnail } = req.files;

  if (!videoFile || !thumbnail) {
    throw new Apierror(400, "Video and/or thumbnail is required");
  }

  const videoFilePath = videoFile[0].path;
  const thumbnailPath = thumbnail[0].path;

  if (!videoFilePath || !thumbnailPath) {
    throw new Apierror(400, "Error while uploading files");
  }

  const uploadedVideo = await uploadvideo(videoFilePath);
  const uploadedThumbnail = await uploadimages(thumbnailPath);

  if (!uploadedVideo || !uploadedThumbnail) {
    throw new Apierror(400, "Error while uploading files to cloud");
  }
  const Fortmattedduration = formatDuration(uploadedVideo.duration);

  const createdVideo = await video.create({
    videofile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title,
    description,
    duration: Fortmattedduration,
    views: 0,
    isPublished: true,
    category,
    owner: req.user,
    visibility,
    tags,
  });

  return res.status(200).json({
    message: "Video uploaded successfully",
    success: true,
    data: createdVideo,
  });
});
const getVideoById = asyncHandler(async (req, res) => {
  const vidId = req.params.videoId;
  const file = await video
    .findById(vidId)
    .populate(
      "owner",
      "-password -refreshtoken -totalViews -isVerified -category"
    );

  if (req?.user != file.owner._id) {
    if (file.visibility === "private") {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
  }
  if (!file) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  const x = await user.findById(file.owner);
  x.totalViews = x.totalViews + 1;
  await x.save();

  // Increment views
  file.views = (file.views || 0) + 1;
  await file.save();

  return res.status(200).json({
    success: true,
    video: file,
  });
});
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const title = req.body?.title;
  const description = req.body?.description;
  const thumbnail = req.file?.path;
  const visibility = req.body?.visibility;

  if (!title && !description && !thumbnail) {
    return res.status(200).json({
      success: true,
      message: "Nothing updated",
    });
  }

  const currVideo = await video.findById(videoId);
  if (!currVideo) {
    throw new Apierror(404, "Video Not Found");
  }

  if (title) currVideo.title = title;
  if (description) currVideo.description = description;

  if (thumbnail) {
    const upload = await uploadimages(thumbnail);
    currVideo.thumbnail = upload.url;
  }
  currVideo.visibility = visibility;

  await currVideo.save();

  return res.status(200).json({
    success: true,
    message: "Video Details Updated",
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new Apierror(400, "Video Deleted/Not Found");
  }

  await video.findByIdAndDelete(videoId);

  return res.status(200).json({
    success: true,
    message: "Video Deleted",
  });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const thisVideo = await video.findById(videoId);
  const oldStatus = thisVideo.isPublished;
  const newS = !oldStatus;
  thisVideo.isPublished = newS;
  await thisVideo.save();

  return res.status(200).json({
    sucess: true,
    message: `Toggled from ${oldStatus} --> ${newS}`,
  });
});

const getTrendingVideos = asyncHandler(async (req, res) => {
  try {
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() - 7);
    const videos = await video.aggregate([
      {
        $match: {
          visibility: "public",
          uploadDate: {
            $gte: sevenDays,
          },
        },
      },

      {
        $addFields: {
          ageHours: {
            $divide: [
              { $subtract: [new Date(), "$uploadDate"] },
              1000 * 60 * 60,
            ],
          },
        },
      },

      {
        $addFields: {
          trendingScore: {
            $add: [
              { $divide: ["$views", "$ageHours"] },
              {
                $multiply: ["$likes", 3],
              },
            ],
          },
        },
      },

      {
        $sort: {
          //in desc order
          trendingScore: -1,
        },
      },

      {
        $limit: 10,
      },

      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },

      {
        $unwind: "$owner",
      },

      {
        $project: {
          "owner.fullname": 1,
          "owner.avatar": 1,
          "owner._id": 1,

          title: 1,
          views: 1,
          duration: 1,
          uploadDate: 1,
          thumbnail: 1,
          videofile: 1,
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Error fetching trending videos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching homepage videos",
    });
  }
});

const getVideosByCategory = asyncHandler(async (req, res) => {});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getTrendingVideos,
  getVideosByCategory,
};
