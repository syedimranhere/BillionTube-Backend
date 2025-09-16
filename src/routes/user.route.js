import { Router } from "express";
import {
  registerUser,
  loginController,
  verifyAccess,
  logoutController,
  changePassword,
  updateUsername,
  updateAvatar,
  getUserInfo,
  getUsersvideo,
  getStats,
  DeleteAccount,
  updateFullname,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
const userRoute = Router();
userRoute.post("/login", loginController);
userRoute.post("/update-username", isAuthenticated, updateUsername);
userRoute.post("/update-fullname", isAuthenticated, updateFullname);
userRoute.get("/videos", isAuthenticated, getUsersvideo);
userRoute.get("/stats", isAuthenticated, getStats);
userRoute.get("/verifyAccess", verifyAccess);
userRoute.get("/id/:userId", getUserInfo);

userRoute.post(
  "/register",
  //this is from multer
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
);

userRoute.post("/logout", isAuthenticated, logoutController);
userRoute.post("/deleteMe", isAuthenticated, DeleteAccount);
userRoute.post("/change-password", isAuthenticated, changePassword);
userRoute.post("/verify", verifyAccess);

userRoute.post(
  "/change-avatar",
  isAuthenticated,
  upload.single("avatar"),
  updateAvatar
);

export default userRoute;
