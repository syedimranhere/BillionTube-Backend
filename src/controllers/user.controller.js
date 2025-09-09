import { Apierror } from "../utils/api.error.js";
import { user } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
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

const option = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // must be true on hosting
  //if its deployed so it cant be same site and hence frontend cant send cookies
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

export const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const userDoc = await user.findById(userId).select("-password");
    if (!userDoc) {
      throw new Apierror(404, "User not found ");
    }
    const accessToken = userDoc.generateaccesstoken();
    const refreshToken = userDoc.generaterefreshtoken();
    userDoc.refreshToken = refreshToken;
    await userDoc.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Apierror(500, error.message || "Token generation failed");
  }
};

// export const generateAccessByRefresh = async (req, res) => {
//   const cookieToken = req.cookies?.refreshToken;
//   if (!cookieToken) {
//     throw new Apierror(401, "Unauthorized Access ");
//   }
//   const isLegit = jwt.verify(cookieToken, process.env.REFRESH_TOKEN_SECRET);
//   if (!isLegit) {
//     throw new Apierror(401, "Invalid Token❗");
//   }
//   const User = await user.findbyId(isLegit.id);
//   if (User.refreshToken !== cookieToken) {
//     throw new Apierror(401, "Invalid Token❗");
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
//     isLegit.id
//   );

//   const option = {
//     httpOnly: true,
//     secure: true,
//   };
//   return res
//     .status(200)
//     .cookie("accesstoken", accessToken, option)
//     .cookie("refreshToken", refreshToken, option)
//     .json({
//       message: "New Tokens Generated",
//     });
// };
export const loginController = asyncHandler(async (req, res) => {
  const { username_or_email, typedpassword } = req.body;

  const userDoc = await user
    .findOne({
      $or: [{ email: username_or_email }, { username: username_or_email }],
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userDoc._id
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json({
      success: true,
      user: userDoc,
    });
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", option);

  res.clearCookie("accessToken", option);

  const id = req.user;
  const USER = await user.findById(id).select("-password ");

  if (!USER) {
    return res.status(404).json({
      type: "error",
      message: "User already logged out or not found 🕵️‍♂️",
    });
  }

  USER.refreshToken = null;
  await USER.save();

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
  const { accessToken } = req.cookies;

  if (!accessToken) return res.status(406).json({ message: "No access token" });

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(406).json({ message: "Invalid access token" });
    }

    const User = await user.findById(decoded.id);
    if (!User) {
      return res.status(406).json({ message: "Invalid access token" });
    }

    res.status(200).json({
      success: true,
      user: User,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid access token" });
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

  if (!email || !password || !fullname || !username || !gender || !country) {
    throw new Apierror(400, "All fields are required");
  }

  if (!testemailvalid(email)) {
    throw new Apierror(400, "Invalid email format ");
  }

  if (!usernamevalid(username)) {
    throw new Apierror(400, "Invalid username ");
  }

  if (!isValidFullname(fullname)) {
    throw new Apierror(400, "Invalid fullname ");
  }

  const userExists = await user
    .findOne({
      $or: [{ email }, { username }],
    })
    .select("-password");

  if (userExists) {
    throw new Apierror(410, "Username/Email already exists");
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
    throw new Apierror(500, "User creation failed ❗");
  }

  return res.status(201).json({
    success: true,
    message: "User created successfully",
  });
});
