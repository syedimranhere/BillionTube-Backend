import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { user } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { usernamevalid, isValidFullname } from "../utils/username.validate.js";
import { uploadcloud } from "../utils/cloudinary.js";
import mongoose from "mongoose";

//first we are going to find user
export const generateAccessAndRefreshTokens = async function (userId) {
     try {
          const userDoc = await user
               .findById(userId)
               // 🧠 Don’t select out -refreshToken if you're about to update it
               .select("-password");
          if (!userDoc) {
               throw new Apierror(404, "User not found ❗");
          }
          //user object itself has methods ( of passchekc and tokens)
          const accessToken = userDoc.generateaccesstoken();
          const refreshToken = userDoc.generaterefreshtoken();
          //but we want refresh token to be stored in DB
          userDoc.refreshToken = refreshToken;
          //also save it, as we are updating the user document ( take time )
          await userDoc.save();

          //its better to have options in a single object

          return { accessToken, refreshToken };
     } catch (error) {
          console.error("Token generation error:", error);
          throw new Apierror(500, error.message || "Token generation failed");
     }
};

export const generateAccessByRefresh = async (req, res) => {
     //first verify user
     const cookieToken = req.cookies?.refreshToken;
     if (!cookieToken) {
          throw new Apierror(401, "Unauthorized Access ❗");
     }
     //Now verify the token with in ENV
     //if verification is successful we will extract id
     //verify returns payload
     const isLegit = jwt.verify(cookieToken, process.env.REFRESH_TOKEN_SECRET);
     if (!isLegit) {
          throw new Apierror(401, "Invalid Token❗");
     }
     //now generate new tokens
     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
          isLegit.id //this is the user ID
     );

     const option = {
          httpOnly: true,
          secure: true,
     };
     // .cookie wasnt done in generating tokens ,we just got tokens outta there
     return res
          .status(200)
          .cookie("accesstoken", accessToken, option)
          .cookie("refreshToken", refreshToken, option)
          .json({
               message: "New Tokens Generated",
          });
     //now we have new tokens and refreshToken is also stored in User.token in DB
};
export const loginController = asyncHandler(async (req, res) => {
     const { username_or_email, typedpassword } = req.body; //its request body

     //userDoc now has all properties of user
     //findone awaits the entire DB so it takes time
     const userDoc = await user.findOne({
          $or: [{ email: username_or_email }, { username: username_or_email }],
     });
     if (!userDoc) {
          throw new Apierror(404, "User not found ❗");
     }
     //once again finding takes time so we use await

     const isPass = await userDoc.isPasswordCorrect(typedpassword);
     //  !! -- User Doc has entire Object -- !!
     if (!isPass) {
          throw new Apierror(400, "Incorrect password ❗");
     }
     //now our use is logged in Time to give him refresh / access tokens
     //but those are sent in cookies ( secure cookies )
     //and ofcourse we have to send em in response
     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
          userDoc._id
     );
     const option = {
          httpOnly: true,
          secure: true,
     };

     //now we have to send these tokens in cookies

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
//but also we have to logout user
export const logoutController = asyncHandler(async (req, res) => {
     //first middleware has alreasdy done 80% work of verifying that yes this is the user

     // 1)clear cookies
     // 2)delete from DB
     // 3)during deletion we need name and options ( and options must match)
     res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
     });

     res.clearCookie("accessToken", {
          httpOnly: true,
          secure: true,
     });
     // we are able to access ID because of middleware
     const id = req.user;
     const USER = await user.findById(id).select("-password -refreshToken");
     //maybe user was deleted and we still had tokens
     if (!USER) {
          throw new Apierror(404, "User not found ❗");
     }
     //)
     //now deleted Token
     USER.refreshToken = null;
     await USER.save();

     return res
          .status(200)
          .json(new ApiResponse(200, {}, "Logged out successfully 🧹"));
});

export const changePassword = asyncHandler(async (req, res) => {
     //but also we have to verify user so we will use middleware (Already used)
     //take old pass and this new pass
     const { oldpass, newpass } = req.body;

     if (!oldpass || !newpass) {
          throw new Apierror(400, "All fields are required ❗");
     }
     //confirm pass

     const User = await user.findById(req.user).select("-refreshToken");
     if (!User) {
          throw new Apierror(404, "User not found ❗");
     }
     console.log(oldpass, newpass);
     const isLegit = await User.isPasswordCorrect(oldpass);
     if (!isLegit) {
          throw new Apierror(400, "Incorrect password ❗");
     }
     //now take pass
     //mongo knows pass was changed so it will re-hash
     User.password = newpass;
     await User.save();
     // const User2 = await user
     //      .findById(User._id)
     //      .select("-password -refreshToken");

     return res.status(200).json({
          success: true,
          message: "Pass Changed Successfully🔒",
     });
});

export const changeAccountDetails = asyncHandler(async function (req, res) {
     //changing username and fullname

     const { username, fullname } = req.body;
     if (!username && !fullname) {
          throw new Apierror(400, "All fields are required ❗");
     }
     //we have the user id
     //req.user is just a property we attached to req

     const User = await user
          .findById(req.user)
          .select("-refreshToken -password");
     if (!User) {
          throw new Apierror(404, "User not found ❗");
     }
     if (!username && !fullname) {
          throw new Apierror(400, "All fields are required ❗");
     }
     if (username && !usernamevalid(username)) {
          throw new Apierror(400, "Invalid username ❗");
     } else {
          //now check if that name was already taken
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
     } else {
          User.fullname = fullname;
     }

     await User.save();
     return res.status(200).json({
          success: true,
          message: "UserDetails Changed",
     });
});

export const updateAvatar = asyncHandler(async (req, res) => {
     //first take if form user
     //only 1 thing in multer so .path only
     const avatarPath = req.file?.path;
     if (!avatarPath) {
          throw new Apierror(400, "Avatar is required ❗");
     }
     //upload it on cloudinary and then extract url
     //this returns a very big object
     const upload = await uploadcloud(avatarPath);
     if (!upload) {
          throw new Apierror(500, "Avatar upload failed ❗");
     }
     const User = await user
          .findById(req.user)
          .select("-refreshToken -password");
     const OldId = User.old_avatar_id;
     User.avatar = upload.url;
     User.old_avatar_id = upload.public_id;
     await User.save();

     //now delete

     if (OldId) {
          await cloudinary.uploader.destroy(OldId);
     }

     return res.status(200).json({
          success: true,
          message: "Avatar Changed",
     });
});
export const updateCover = asyncHandler(async function (req, res) {
     //the same exact procedure
     // only 1 file so thats why not req.files
     const coverPath = req.file?.path;
     if (!coverPath) {
          throw new Apierror(400, "Cover Image is required ❗");
     }

     const User = await user
          .findById(req.user)
          .select("-refreshToken -password");
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
     //now do agregation
     //this aggregation takes array of stages ( filters )
     const channel = await user.aggregate([
          {
               //first filtr
               //this match will search entire DB
               $match: {
                    //there can be chance this matching fails
                    username: username.trim().toLowerCase(),
               },
          },
          {
               //second filter
               $lookup: {
                    //lowercase and plural
                    from: "subscriptions",
                    //this is the user._id, that we are gonna match
                    localField: "_id",
                    //foreign field is form the subscription
                    foreignField: "subscriber", //me kahan kahan subscribed huun
                    as: "SubscribedTo",
               },
          },
          {
               //3rd stage / filter
               $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    //am i that channel people have subscribed to
                    foreignField: "channel",
                    //this as is also adding a field
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
                                   //if this user is in the list where i am subscribed to, so alright
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
     //now channel will return
     if (!channel?.length) {
          throw new Apierror(404, "User not found ❗");
     }
     return res.status(200).json({
          success: true,
          data: channel[0], //because only 1 project (object ) is coming here
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
                    //current user id, not all ids
                    foreignField: "_id",
                    //so a watch history for User Will be created
                    as: "WatchHistory",
                    pipeline: [
                         //now add further stages here
                         {
                              //now that we have videos array, we want owner of those videos, from USERS
                              $lookup: {
                                   //now search entire
                                   from: "users",
                                   //we chose owner becuase now in this pipeline lookup we are inside our array of videos
                                   localField: "owner",
                                   foreignField: "_id",
                                   as: "OWNER",
                                   // inside watchhistory another filed OWNER has been created
                                   pipeline: [
                                        {
                                             //ofc we got full users info, but we dont want full
                                             $project: {
                                                  //we only want these 2 for owner
                                                  fullname: 1,
                                                  username: 1,
                                             },
                                        },
                                   ],
                              },
                              //now weve got array of Owners
                         },
                    ],
               },
          },
     ]);
     return res.status(200).json({
          success: true,
          data: User[0].WatchHistory,
          // below one will return first video
          // data: User.WatchHistory[0],
     });
});
