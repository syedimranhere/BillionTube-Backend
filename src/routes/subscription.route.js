import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  subscriptionStatus,
  deleteSubscription,
} from "../controllers/subscription.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import { Router } from "express";

const subscriptionRouter = Router();
subscriptionRouter.route("/c/:channelId").get(getUserChannelSubscribers);
subscriptionRouter.use(isAuthenticated);

subscriptionRouter.route("/c/:channelId").post(toggleSubscription);
subscriptionRouter.route("/u").get(getSubscribedChannels);
subscriptionRouter.route("/c/subscribed/:channelId").get(subscriptionStatus);
subscriptionRouter
  .route("/deletesubscription/:channelId")
  .delete(deleteSubscription);
export { subscriptionRouter };
