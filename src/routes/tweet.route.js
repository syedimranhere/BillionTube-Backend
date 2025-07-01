import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import {
     createTweet,
     getUserTweets,
     updateTweet,
     deleteTweet,
} from "../controllers/tweet.controller.js";
const tweetRoute = Router();

tweetRoute.use(isAuthenticated);
//define all routes

tweetRoute.route("/").post(createTweet);
tweetRoute.route("/user/:userId").get(getUserTweets);
tweetRoute.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
export { tweetRoute };
