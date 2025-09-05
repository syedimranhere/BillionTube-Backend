import { Router } from "express";
import {
  addToWatchHistory,
  deleteAvideofromWatchHistory,
  deleteEntireWatchhistory,
  getEntireWatchHistory,
  Deleteforall,
} from "../controllers/watchhistory.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";

export const watchHistoryRouter = Router();
watchHistoryRouter.route("/delete-for-all/:videoId").delete(Deleteforall);

watchHistoryRouter.use(isAuthenticated);

watchHistoryRouter.route("/a/:videoId").post(addToWatchHistory);
watchHistoryRouter.route("/d/:videoId").delete(deleteAvideofromWatchHistory);
watchHistoryRouter.route("/delete-all").delete(deleteEntireWatchhistory);
watchHistoryRouter.route("/gethistory").get(getEntireWatchHistory);
