import jwt from "jsonwebtoken";
export const getUserId = async (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    req.user = jwt.verify(token, process.env.TOKEN_SECRET).id;
  }

  next();
};
