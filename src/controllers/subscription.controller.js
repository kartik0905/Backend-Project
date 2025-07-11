import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/APIErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel id required");
  }

  if (String(channelId) === String(req.user?._id)) {
    throw new ApiError(400, "User cannot subscribe to his own channel");
  }

  const isChannelExist = await User.exists({ _id: channelId });
  if (!isChannelExist) {
    throw new ApiError(404, "Channel with this id does not exist");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?.id,
  });

  let isSubscribed;

  if (!subscription) {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user?.id,
    });
    isSubscribed = true;
  } else {
    await Subscription.deleteOne({ _id: subscription._id });
    isSubscribed = false;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Channel has been ${isSubscribed ? "subscribed" : "unsubscribed"} successfully`
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channel id is required");
  }
  const isChannelExist = await User.exists({ _id: channelId });
  if (!isChannelExist) {
    throw new ApiError(404, "channel not found with this channel id");
  }

  const { Types } = mongoose;
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$subscriberInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        username: "$subscriberInfo.username",
        fullName: "$subscriberInfo.fullName",
        avatar: "$subscriberInfo.avatar",
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriber: subscriberList },
        "all subscriber details of the given channel are fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "subscriber id is required");
  }

  const { Types } = mongoose;

  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$channelInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        username: "$channelInfo.username",
        fullName: "$channelInfo.fullname",
        avatar: "$channelInfo.avatar",
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriber: channelList },
        "All channel details subscribed by the subscriber are fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
