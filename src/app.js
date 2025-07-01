//here express will be done
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//all these are configured after app is created
const app = express();
app.use(
     cors({
          origin: process.env.CORS_ORIGIN, // must be a full string URL
          credentials: true, // allows cookies/auth headers
     })
);

app.use(express.json({
     limit:"5000kb"
}));
app.use(
     express.urlencoded({
          //processes data in pro style
          extended: true,
          //   ofcourse limit
          limit: "20kb",
     })
);
app.use(
     cookieParser({
          //perform crud on cookies
          //makes cookies in readable format
     })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
     res.json({
          success: true,
          message: "Welcome to the API",
     });
});

//router is basically route where user will go if he goes to user
import userRoute from "./routes/user.route.js";
// below one is the main route
//if user goes to /api/v1/user it will go to user route
// it wont redirect to user.route.js but it will use the logic defined in user.route.js
// so we have to go to a url which has a prefix of /api/v1/user

// !-- PREFIX --!

//if someone comes on this prefix do this
app.use("/api/v1/user", userRoute);
import commentsRoute from "./routes/comment.route.js";

app.use("/api/v1/comments", commentsRoute);

import {likeRoute} from "./routes/likes.route.js";
app.use("/api/v1/likes", likeRoute);

import {tweetRoute} from "./routes/tweet.route.js";
app.use("/api/v1/tweets", tweetRoute);


import{videoRoute} from "./routes/video.route.js";
app.use("/api/v1/videos", videoRoute); 
export { app };
