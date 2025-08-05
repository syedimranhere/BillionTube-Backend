import jwt from "jsonwebtoken";
import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { user } from "../models/user.model.js";

// Middleware to verify user authentication via refresh token
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new Apierror(401, "Authentication required ❗");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new Apierror(401, "Invalid or expired token ❗");
  }

  const existingUser = await user
    .findById(decoded.id)
    .select("-password -refreshToken");

  if (!existingUser) {
    throw new Apierror(401, "User not found ❗");
  }

  req.user = existingUser._id;
  next();
});
