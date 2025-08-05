import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content.trim()) {
    throw new Apierror(400, "Content is required");
  }

  await tweet.create({
    content,
    owner: req.user,
  });

  return res.status(200).json({
    success: true,
    message: "Tweet created",
  });
});

const getUserTweets = asyncHandler(async (req, res) => {
  const myTweets = await tweet
    .find({ owner: req.params.userId })
    .select("content -_id");

  return res.status(200).json({
    success: true,
    data: myTweets,
  });
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content.trim()) {
    throw new Apierror(400, "Content is required");
  }

  const Update = await tweet.findById(req.params.tweetId);
  Update.content = content;
  await Update.save();

  return res.status(200).json({
    success: true,
    message: "Tweet Updated",
  });
});

const deleteTweet = asyncHandler(async (req, res) => {
  if (!req.params.tweetId) {
    throw new Apierror(400, "Tweet Deleted/Not Found");
  }

  const D = await tweet.findByIdAndDelete(req.params.tweetId);
  if (!D) {
    throw new Apierror(400, "Tweet Deleted/Not Found");
  }

  return res.status(200).json({
    success: true,
    message: "Tweet Deleted",
  });
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
