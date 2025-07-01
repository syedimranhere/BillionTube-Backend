import { Router } from "express";
//the logic we are gonna use here is  register user
import { registerUser } from "../controllers/register.controller.js";
import { loginController } from "../controllers/login-logout.controller.js";
import { logoutController } from "../controllers/login-logout.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import { generateAccessByRefresh } from "../controllers/login-logout.controller.js";
import { changePassword } from "../controllers/login-logout.controller.js";
import { changeAccountDetails } from "../controllers/login-logout.controller.js";
import {updateAvatar}from "../controllers/login-logout.controller.js";
import {updateCover}from "../controllers/login-logout.controller.js";
import {getUserchannel} from "../controllers/login-logout.controller.js";
import {getWatchHistory} from "../controllers/login-logout.controller.js";


const userRoute = Router();
// post is when user will tryna fill form it will run register user

//if specific prefix is gonna git this it will register user

// now when ==>> post so we are using multer to handle file uploads
// multer is a middleware that will handle file uploads
// we are using fields to handle multiple files and we are using maxCount to limit the number of files
userRoute.post(
     "/register",
     //upon clicking post on this route these two upload fields will be sent to multer thing and multer sends to temp
     upload.fields([
          //array of (diff objects) where each object has name and maxCount
          //avatar itself an array of objects
          { name: "avatar", maxCount: 1 },
          { name: "coverimage", maxCount: 1 },
     ]),
     registerUser
);

userRoute.post("/login", loginController);
userRoute.post("/logout", isAuthenticated, logoutController);
//no veirfication needed in below one because we already did verification there
userRoute.post("/get-token", generateAccessByRefresh);
// !!--BELOW WE WILL MODIFY OUR REQ --!!
userRoute.post("/change-pass", isAuthenticated, changePassword);
userRoute.patch("/change-details", isAuthenticated, changeAccountDetails);

//upload.single is middleware
userRoute.post("/change-avatar", isAuthenticated,upload.single("avatar"), updateAvatar);
userRoute.post("/change-cover", isAuthenticated,upload.single("coverImage"), updateCover);
// router.post("/get-channel", isAuthenticated,getUserchannel);

//a lil bit harder functions
userRoute.get("/check/:username", isAuthenticated, getUserchannel);
userRoute.get("/history", isAuthenticated, getWatchHistory);
export default userRoute;
// the logic handle
