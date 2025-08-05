import { asyncHandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { user } from "../models/user.model.js";
import { uploadcloud } from "../utils/cloudinary.js";
import {
  usernamevalid,
  testemailvalid,
  isValidFullname,
} from "../utils/username.validate.js";

const defaultCover =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLxuhFgsAv71mb5IB16_1YYaSfi9HCTy_lg&s";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (!email || !password || !fullname || !username) {
    throw new Apierror(400, "All fields are required");
  }

  if (!testemailvalid(email)) {
    throw new Apierror(400, "Invalid email format ❗");
  }

  if (!usernamevalid(username)) {
    throw new Apierror(400, "Invalid username ❗");
  }

  if (!isValidFullname(fullname)) {
    throw new Apierror(400, "Invalid fullname ❗");
  }

  const userExists = await user.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new Apierror(410, "Username/Email already exists");
  }

  const avatarpath = req.files?.avatar?.[0]?.path;
  const coverpath = req.files?.coverimage?.[0]?.path;

  if (!avatarpath) {
    throw new Apierror(420, "Avatar is required ❗");
  }

  const avatar = await uploadcloud(avatarpath);

  if (!avatar) {
    throw new Apierror(500, "Avatar upload failed ❗");
  }

  const cover = coverpath
    ? await uploadcloud(coverpath)
    : await uploadcloud(defaultCover);

  const ourUser = await user.create({
    email,
    avatar: avatar.url,
    old_avatar_id: avatar.public_id,
    old_cover_id: avatar.cover_id,
    coverimage: cover ? cover.url : defaultCover,
    fullname,
    username,
    password,
  });

  const confirm = await user
    .findById(ourUser._id)
    .select("-refreshtoken -password");

  if (!confirm) {
    throw new Apierror(500, "User creation failed ❗");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, confirm, "User created successfully"));
});
