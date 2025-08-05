import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { user } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { usernamevalid, isValidFullname } from "../utils/username.validate.js";
import { uploadcloud } from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const userDoc = await user.findById(userId).select("-password");
    if (!userDoc) {
      throw new Apierror(404, "User not found ❗");
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

export const generateAccessByRefresh = async (req, res) => {
  const cookieToken = req.cookies?.refreshToken;
  if (!cookieToken) {
    throw new Apierror(401, "Unauthorized Access ❗");
  }

  const isLegit = jwt.verify(cookieToken, process.env.REFRESH_TOKEN_SECRET);
  if (!isLegit) {
    throw new Apierror(401, "Invalid Token❗");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    isLegit.id
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json({
      message: "New Tokens Generated",
    });
};

export const loginController = asyncHandler(async (req, res) => {
  const { username_or_email, typedpassword } = req.body;

  const userDoc = await user.findOne({
    $or: [{ email: username_or_email }, { username: username_or_email }],
  });
  if (!userDoc) {
    throw new Apierror(404, "User not found ❗");
  }

  const isPass = await userDoc.isPasswordCorrect(typedpassword);
  if (!isPass) {
    throw new Apierror(400, "Incorrect password ❗");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userDoc._id
  );
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: accessToken,
          refreshToken,
        },
        "LOGGED IN MATE💎"
      )
    );
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
  });

  const id = req.user;
  const USER = await user.findById(id).select("-password -refreshToken");
  if (!USER) {
    throw new Apierror(404, "User not found ❗");
  }

  USER.refreshToken = null;
  await USER.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully 🧹"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldpass, newpass } = req.body;

  if (!oldpass || !newpass) {
    throw new Apierror(400, "All fields are required ❗");
  }

  const User = await user.findById(req.user).select("-refreshToken");
  if (!User) {
    throw new Apierror(404, "User not found ❗");
  }

  const isLegit = await User.isPasswordCorrect(oldpass);
  if (!isLegit) {
    throw new Apierror(400, "Incorrect password ❗");
  }

  User.password = newpass;
  await User.save();

  return res.status(200).json({
    success: true,
    message: "Pass Changed Successfully🔒",
  });
});

export const changeAccountDetails = asyncHandler(async function (req, res) {
  const { username, fullname } = req.body;
  if (!username && !fullname) {
    throw new Apierror(400, "All fields are required ❗");
  }

  const User = await user.findById(req.user).select("-refreshToken -password");
  if (!User) {
    throw new Apierror(404, "User not found ❗");
  }

  if (username && !usernamevalid(username)) {
    throw new Apierror(400, "Invalid username ❗");
  } else if (username) {
    const Exist = await user.findOne({
      username: username,
    });
    if (Exist) {
      throw new Apierror(400, "Username already taken❗❗❗");
    }
    User.username = username;
  }

  if (fullname && !isValidFullname(fullname)) {
    throw new Apierror(400, "Invalid Name ❗");
  } else if (fullname) {
    User.fullname = fullname;
  }

  await User.save();
  return res.status(200).json({
    success: true,
    message: "UserDetails Changed",
  });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new Apierror(400, "Avatar is required ❗");
  }

  const upload = await uploadcloud(avatarPath);
  if (!upload) {
    throw new Apierror(500, "Avatar upload failed ❗");
  }

  const User = await user.findById(req.user).select("-refreshToken -password");
  const OldId = User.old_avatar_id;
  User.avatar = upload.url;
  User.old_avatar_id = upload.public_id;
  await User.save();

  if (OldId) {
    await cloudinary.uploader.destroy(OldId);
  }

  return res.status(200).json({
    success: true,
    message: "Avatar Changed",
  });
});

export const updateCover = asyncHandler(async function (req, res) {
  const coverPath = req.file?.path;
  if (!coverPath) {
    throw new Apierror(400, "Cover Image is required ❗");
  }

  const User = await user.findById(req.user).select("-refreshToken -password");
  if (!User) {
    throw new Apierror(404, "User not found ❗");
  }

  const upload = await uploadcloud(coverPath);
  if (!upload || !upload.public_id) {
    throw new Apierror(500, "Cover Image upload failed ❗");
  }
  const OldId = User.old_cover_id;
  User.old_cover_id = upload.public_id;
  User.coverimage = upload.url;
  await User.save();

  if (OldId) {
    await cloudinary.uploader.destroy(OldId);
  }

  return res.status(200).json({
    success: true,
    message: "CoverImage Changed",
  });
});

export const getUserchannel = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new Apierror(400, "Username is required ❗");
  }

  const channel = await user.aggregate([
    {
      $match: {
        username: username.trim().toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $addFields: {
        firstSub: {
          $first: "$SubscribedTo",
        },
        SubsCount: {
          $size: "$Subscribers",
        },
        SubtoCount: {
          $size: "$SubscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user, "$Subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        firstSub: 1,
        Subscribers: 1,
        SubscribedTo: 1,
        SubsCount: 1,
        SubToCount: 1,
        avatar: 1,
        username: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new Apierror(404, "User not found ❗");
  }
  return res.status(200).json({
    success: true,
    data: channel[0],
  });
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const User = await user.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "history",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "OWNER",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    data: User[0].WatchHistory,
  });
});
