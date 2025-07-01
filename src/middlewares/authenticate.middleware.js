// this will be used to authenticate the user when loggin out
import jwt from "jsonwebtoken";
import { Apierror } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { user } from "../models/user.model.js";
// !! -- This will veirfy that yes this person needs to logout -- !!
export const isAuthenticated = asyncHandler(async (req, res, next) => {
     try {
          // 1)first get cookies
          // 2)then get tokens
          // 3)then verify them

          //this time we are taking from request cookies

          //there are multiple cookies so we only want refresh token
          const cookieToken = req.cookies?.refreshToken;
          if (!cookieToken) {
               throw new Apierror(401, "You are not authenticated ❗");
          }
          //now we have to verify the token
          //we have to verify the token using jwt.verify

          //  !!-- This verification is necesary as it proves that yes this was the user
          //once its verified its decoded, into payload ( so isLegit is storing payload basic)
          //and our payload has
          const isLegit = jwt.verify(
               cookieToken,
               process.env.REFRESH_TOKEN_SECRET
          );
          if (!isLegit) {
               throw new Apierror(401, "Invalid token ❗");
          }
          const User = await user
               //is legit has our payload
               .findById(isLegit.id)
               .select("-password -refreshToken");
          //it can be that there can be tokens but no User, maybe deleted
          if (!User) {
               throw new Apierror(401, "User not found ❗");
          }

          //this below line can be used in login logout controller
          // however we pass User only but for our ease im doing User.id
          req.user = User._id;
          //pass/go to next function
          next();
     } catch (error) {
          throw new Apierror(401, error.message || "AUTHENTICATION FAILED ❗");
     }
});
