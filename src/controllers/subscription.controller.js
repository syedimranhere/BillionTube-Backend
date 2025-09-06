import { Apierror } from "../utils/api.error.js";
import { user } from "../models/user.model.js";
import { subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new Apierror(400, "Channel ID is required");
  }

  const channelExists = await user.findById(channelId);
  if (!channelExists) {
    return res.status(404).json({
      success: false,
      message: "Channel not found !!",
    });
  }

  const subscriptionModel = await subscription.findOne({
    subscriber: req.user, // already ObjectId from auth middleware
    channel: channelId,
  });

  if (subscriptionModel) {
    await subscription.findOneAndDelete({
      subscriber: req.user,
      channel: channelId,
    });

    return res.status(200).json({
      success: true,
      message: "Unsubscribed",
    });
  } else {
    await subscription.create({
      subscriber: req.user,
      channel: channelId,
    });

    return res.status(200).json({
      success: true,
      message: "Subscribed",
    });
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new Apierror(400, "Subscriber ID is required");
  }

  const subscribers = await subscription
    .find({
      channel: channelId,
    })
    .select("subscriber -_id");

  return res.status(200).json({
    success: true,
    Number_Of_Subscribers: subscribers.length,
    Subscribers: subscribers,
  });
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user;

  const channels = await subscription
    .find({
      subscriber: subscriberId,
    })
    .populate("channel")
    .select("channel -_id ");

  return res.status(200).json({
    success: true,
    data: channels,
  });
});

const subscriptionStatus = asyncHandler(async (req, res) => {
  const exists = await subscription.findOne({
    subscriber: req.user,
    channel: req.params.channelId,
  });
  if (exists) {
    return res.status(200).json({
      success: true,
    });
  }

  return res.status(200).json({
    success: false,
  });
});

const deleteSubscription = asyncHandler(async (req, res) => {
  const userId = req.user;
  const chanelId = req.params.channelId;
  await subscription.findOneAndDelete({
    subscriber: userId,
    channel: chanelId,
  });
  return res.status(200).json({
    success: true,
    message: "Subscription removed",
  });
});

export {
  deleteSubscription,
  toggleSubscription,
  subscriptionStatus,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
