import jwt from "jsonwebtoken";
export const getUserId = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (token) {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).id;
  }

  next();
};
