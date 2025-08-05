import { Apierror } from "../utils/api.error.js";
import { user } from "../models/user.model.js";
import { subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new Apierror(400, "Channel ID is required");
  }

  const subscriber = await user.findById(req.user);
  const channel = await user.findById(channelId);

  const subscriptionModel = await subscription.findOne({
    subscriber,
    channel,
  });

  if (subscriptionModel) {
    await subscription.findOneAndDelete({
      subscriber,
      channel,
    });

    return res.status(200).json({
      success: true,
      message: "Unsubscribed",
    });
  } else {
    await subscription.create({
      subscriber,
      channel,
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
  const { subscriberId } = req.params;

  const channels = await subscription
    .find({
      subscriber: subscriberId,
    })
    .select("channel -_id");

  return res.status(200).json({
    success: true,
    channels_no: channels.length,
    subscribed_To: channels,
  });
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
