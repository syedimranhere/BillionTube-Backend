import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async function (req, res) {
  const videoID = req.params.videoId;
  const thisVideosComments = await comment
    .find({ video: videoID })
    .select("content -_id");
  return res.status(200).json({
    success: true,
    comments: thisVideosComments,
  });
});

const addComment = asyncHandler(async (req, res) => {
  const Owner = req.user;
  const { content } = req.body;
  const videoId = req.params.videoId;

  if (!content) {
    throw new Apierror(400, "Content is required");
  }

  const Comment = await comment.create({
    content,
    video: videoId,
    owner: Owner,
  });

  return res.status(200).json({
    message: "Comment Generated",
    commentObj: Comment,
  });
});

const updateComment = asyncHandler(async function (req, res) {
  const ID = req.params.commentId;

  const Comment = await comment.findById(ID);
  if (!Comment) {
    throw new Apierror(404, "Comment not found");
  }

  const { newContent } = req.body;
  if (!newContent) {
    throw new Apierror(400, "Content is required");
  }

  Comment.content = newContent;
  await Comment.save();

  return res.status(200).json({
    success: true,
  });
});

const deleteComment = asyncHandler(async function (req, res) {
  const ID = req.params.commentId;
  const Comment = await comment.findByIdAndDelete(ID);
  if (!Comment) {
    throw new Apierror(404, "Comment not found");
  }

  return res.status(200).json({
    success: true,
  });
});

export { addComment, updateComment, deleteComment, getVideoComments };
