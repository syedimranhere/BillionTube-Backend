import { Apierror } from "../utils/api.error.js";
import { user } from "../models/user.model.js";

import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import {
  usernamevalid,
  isValidFullname,
  testemailvalid,
} from "../utils/username.validate.js";
import { uploadimages } from "../utils/cloudinary.js";
import { video } from "../models/video.model.js";
import { like } from "../models/like.model.js";
import { subscription } from "../models/subscription.model.js";
import { comment } from "../models/comment.model.js";
import { dislike } from "../models/dislike.model.js";

const option = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};
export const getUsersvideo = async (req, res) => {
  const userId = req.user;

  if (!userId) {
    return res.status(400).json({
      success: false,
    });
  }

  const videos = await video.find({ owner: userId });
  return res.status(200).json({
    success: true,
    data: videos,
  });
};

export const getUserInfo = async (req, res) => {
  const { userId } = req.params;

  const User = await user.findById(userId).select("-password");

  if (!User) {
    return res.status(404).json({
      success: false,
    });
  }

  return res.status(200).json({
    success: true,
    data: User,
  });
};

export const loginController = asyncHandler(async (req, res) => {
  const { username_or_email, typedpassword } = req.body;

  const userDoc = await user
    .findOne({
      $or: [
        { email: username_or_email.trim() },
        { username: username_or_email.trim() },
      ],
    })
    .select("+password");

  if (!userDoc) {
    return res.status(404).json({
      type: "error",
      message: "No user found with this email or username",
    });
  }

  const isPass = await userDoc.isPasswordCorrect(typedpassword);
  if (!isPass) {
    return res.status(400).json({
      type: "error",
      message: "Your password doesn't match",
    });
  }

  const token = jwt.sign(
    {
      id: userDoc._id,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRY,
    }
  );

  return res.status(200).cookie("token", token, option).json({
    success: true,
    user: userDoc,
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("token", option);

  const id = req.user;
  const USER = await user.findById(id).select("-password ");

  if (!USER) {
    return res.status(404).json({
      type: "error",
      message: "User already logged out or not found 🕵️‍♂️",
    });
  }

  return res.status(200).json({
    type: "success",
    message: "Successfully logged out. See you again! 👋",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldpass, newpass } = req.body;

  if (!oldpass || !newpass) {
    return res.status(400).json({
      success: false,
      message: "All fields are required ",
    });
  }

  const User = await user.findById(req.user).select("-password");
  if (!User) {
    return res.status(400).json({
      success: false,
      message: "User not found ",
    });
  }

  const isLegit = await User.isPasswordCorrect(oldpass);
  if (!isLegit) {
    return res.status(400).json({
      success: false,
      message: "Old Password is incorrect",
    });
  }

  User.passwordUpdatedAt = Date.now();
  User.password = newpass;
  await User.save();

  return res.status(200).json({
    success: true,
    message: "Pass Changed Successfully🔒",
  });
});

export const updateUsername = asyncHandler(async function (req, res) {
  const { username } = req.body;

  const User = await user.findById(req.user).select("-password");
  if (!User) {
    throw new Apierror(404, "User not found ❗");
  }

  if (username && !usernamevalid(username)) {
    return res.status(404).json({
      success: false,
      message: "Invalid username ❗",
    });
  }
  const Exist = await user
    .findOne({
      username,
    })
    .select("-password");
  if (Exist) {
    throw new Apierror(400, "Username already taken❗❗❗");
  }
  User.username = username;

  await User.save();
  return res.status(200).json({
    success: true,
    message: "username Changed",
  });
});

export const updateFullname = asyncHandler(async function (req, res) {
  const { fullname } = req.body;

  const User = await user.findById(req.user).select("-password");
  if (!User) {
    throw new Apierror(404, "User not found ❗");
  }

  if (fullname && !isValidFullname(fullname)) {
    return res.status(404).json({
      success: false,
      message: "Invalid Fullname ❗",
    });
  }
  const Exist = await user
    .findOne({
      fullname,
    })
    .select("-password");
  if (Exist) {
    throw new Apierror(400, "Username already taken❗");
  }
  User.fullname = fullname;

  await User.save();
  return res.status(200).json({
    success: true,
    message: "username Changed",
  });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new Apierror(400, "Avatar is required ");
  }

  const upload = await uploadimages(avatarPath);
  if (!upload) {
    throw new Apierror(500, "Avatar upload failed ❗");
  }

  const User = await user.findById(req.user).select("-password");

  User.avatar = upload.url;
  await User.save();
  return res.status(200).json({
    success: true,
    avatar: User.avatar,
    message: "Avatar Changed",
  });
});
export const verifyAccess = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(406).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(406).json({ message: "Invalid token" });
    }

    const User = await user.findById(decoded.id);
    if (!User) {
      return res.status(406).json({ message: "Invalid token" });
    }

    res.status(200).json({
      success: true,
      user: User,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const getStats = async (req, res) => {
  const id = req.user;
  const videos = await video.find({ owner: id });
  const likes = await like.find({ likedTo: id });
  const subscribers = await subscription.find({ channel: id });
  const userDoc = await user.findById(id).select("-password");
  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }
  const views = userDoc.totalViews;
  return res.status(200).json({
    success: true,
    data: {
      totalVideos: videos.length,
      likes: likes.length,
      subscribers: subscribers.length,
      views: views,
      avatar: userDoc.avatar,
      fullname: userDoc.fullname,
      username: userDoc.username,
      email: userDoc.email,
    },
  });
};
export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, gender, country } = req.body;

  if (!testemailvalid(email)) {
    return res.status(404).json({
      type: "error",
      message: "Invalid email format",
    });
  }

  if (!usernamevalid(username)) {
    return res.status(404).json({
      type: "error",
      message: "Invalid username",
    });
  }

  if (!isValidFullname(fullname)) {
    return res.status(404).json({
      type: "error",
      message: "Invalid Fullname",
    });
  }

  const userExists = await user
    .findOne({
      $or: [{ email }, { username }],
    })
    .select("-password");

  if (userExists) {
    return res.status(404).json({
      type: "error",
      message: "Email/Username already exists",
    });
  }

  const avatarpath = req.files?.avatar?.[0]?.path;
  let avatar = "";
  if (avatarpath != null) {
    avatar = await uploadimages(avatarpath);
  }

  const ourUser = await user.create({
    email,
    avatar: avatar ? avatar.url : "",
    fullname,
    username,
    password,
    gender,
    country,
  });

  const confirm = await user.findById(ourUser._id).select("-password");

  if (!confirm) {
    return res.status(500).json({
      type: "error",
      message: "Server failed creating user",
    });
  }

  return res.status(201).json({
    success: true,
    message: "User created successfully",
  });
});

export const DeleteAccount = asyncHandler(async (req, res) => {
  try {
    // Delete all user-related data
    await user.findByIdAndDelete(req.user);
    await video.deleteMany({ owner: req.user });
    await like.deleteMany({ owner: req.user });
    await dislike.deleteMany({ dislikedBy: req.user });
    await comment.deleteMany({ owner: req.user });
    await subscription.deleteMany({ subscriber: req.user });

    console.log("Account deletion completed");

    // Clear the cookie
    res.clearCookie("token", option);

    // IMPORTANT: Send a proper JSON response
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
});
