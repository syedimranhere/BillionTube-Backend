import {
     toggleSubscription,
     getUserChannelSubscribers,
     getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import { Router } from "express";

const subscriptionRouter = Router();
subscriptionRouter.use(isAuthenticated);

subscriptionRouter
     .route("/c/:channelId")
     .get(getUserChannelSubscribers)
     .post(toggleSubscription);
subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);
export { subscriptionRouter };
