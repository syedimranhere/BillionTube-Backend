import jwt from "jsonwebtoken";
import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { user } from "../models/user.model.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new Apierror(401, "Authentication required ❗");
  }
  let decoded;
  try {
    //jwt verify return a decoded token which is a json object and has the user id in it
    decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch {
    throw new Apierror(401, "Invalid or expired token ");
  }

  const existingUser = await user.findById(decoded.id).select("-password ");

  if (!existingUser) {
    throw new Apierror(401, "User not found ");
  }

  req.user = existingUser._id;
  next();
});
