import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
     //TODO: create tweet
     const { content } = req.body;
     if (!content.trim()) {
          throw new Apierror(400, "Content is required");
     }
     const createdTweet = await tweet.create({
          content,
          owner: req.user,
     });
     return res.status(200).json({
          success: true,
          message: "Tweet created",
     });
});

const getUserTweets = asyncHandler(async (req, res) => {
     // get this users tweets

     const myTweets = await tweet
          .find({
               owner: req.params.userId, //becuase it can be another user also
          })
          .select("content -_id");

     return res.status(200).json({
          success: true,
          data: myTweets,
     });
});

const updateTweet = asyncHandler(async (req, res) => {
     //first get the tweet ID
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
     //first get the tweet ID
 
     if(!req.params.tweetId){
          throw new Apierror(400, "Tweet Deleted/Not Found");
     }
    const D = await tweet.findByIdAndDelete(req.params.tweetId);
    if(!D){
         throw new Apierror(400, "Tweet Deleted/Not Found");
    }
     return res.status(200).json({
          success: true,
          message: "Tweet Deleted",
     })
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
