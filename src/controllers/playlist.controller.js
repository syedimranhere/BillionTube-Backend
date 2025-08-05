import { asyncHandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/api.error.js";
import { playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new Apierror(400, "Name and description are required");
  }

  await playlist.create({
    name,
    description,
    owner: req.user,
  });

  return res.status(200).json({
    message: `Playlist Created with name [ ${name} ]`,
  });
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new Apierror(400, "User ID not provided");
  }

  const playlists = await playlist.find({ owner: userId });

  return res.status(200).json({
    success: true,
    data: playlists,
  });
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new Apierror(400, "Playlist ID not provided");
  }

  const ourPlaylist = await playlist.find({ _id: playlistId });

  return res.status(200).json({
    success: true,
    data: ourPlaylist,
  });
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new Apierror(400, "Playlist ID or Video ID not provided");
  }

  await playlist.findByIdAndUpdate(playlistId, {
    $push: {
      videos: videoId,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Video Added to Playlist",
  });
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new Apierror(400, "Playlist ID or Video ID not provided");
  }

  await playlist.findByIdAndUpdate(playlistId, {
    $pull: {
      videos: videoId,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Video Removed from Playlist",
  });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new Apierror(400, "Playlist ID not provided");
  }

  await playlist.findByIdAndDelete(playlistId);

  return res.status(200).json({
    success: true,
    message: "Playlist Deleted",
  });
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new Apierror(400, "Playlist ID not provided");
  }

  if (!name && !description) {
    return res.status(200).json({
      success: true,
      message: "Nothing Updated",
    });
  }

  const ourPlaylist = await playlist.findById(playlistId);

  if (name) {
    ourPlaylist.name = name;
  }
  if (description) {
    ourPlaylist.description = description;
  }

  await ourPlaylist.save();

  return res.status(200).json({
    success: true,
    message: "Playlist Details Updated",
  });
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
