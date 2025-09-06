import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import {
  addVideoinWatchLater,
  removeVideoinWatchLater,
  getWatchLatervideos,
} from "../controllers/watchlater.controller.js";

const watchlaterRoute = Router();
watchlaterRoute.use(isAuthenticated);
watchlaterRoute.route("/a/:videoId").post(addVideoinWatchLater);
watchlaterRoute.route("/r/:videoId").post(removeVideoinWatchLater);
watchlaterRoute.route("/videos").get(getWatchLatervideos);

export { watchlaterRoute };
