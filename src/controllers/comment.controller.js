import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { comment } from "../models/comment.model.js";
import { user } from "../models/user.model.js";
import { video } from "../models/video.model.js";

//add update delete and  getVideoComments
//the below one will run on get
const getVideoComments = asyncHandler(async function (req, res) {
     //shows all Video Comments

     const videoID = req.params.videoId;
     const thisVideosComments = await comment
          .find(
               //  show only content, bu thide _id and other things
               { video: videoID }
          )
          .select("content -_id");
     return res.status(200).json({
          success: true,
          comments: thisVideosComments, //its an array
     });
});
const addComment = asyncHandler(async (req, res) => {
     //only return content from there ( the body )
     const Owner = req.user;
     //below one will go in raw json
     const { content } = req.body;
     const videoId = req.params.videoId; //red .params is itself an id
     //  const  videoId  =req.params.videoId.trim();
     if (!content) {
          throw new Apierror(400, "Content is required");
     }
     //now create Object

     const Comment = await comment.create({
          content,
          video: videoId,
          //the user who typed comment
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
