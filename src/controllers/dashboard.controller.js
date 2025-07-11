import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/APIErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const stats = {};
  stats.totalVideoViews = 0;
  stats.totalVideo = 0;
  stats.totalLikes = 0;

  const {Types} = mongoose;

  const views = await Video.aggregate([
    {
      $match: {
        owner: new Types.ObjectId(req.user?.id),
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "video",
        localField: "_id",
        as: "videoLikes",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$videoLikes" },
      },
    },
    {
      $group: {
        _id: "owner",
        viewsCount: { $sum: "$views" },
        videoCount: { $sum: 1 },
        totalLikes: { $sum: "$likeCount" },
      },
    },
  ]);

  if (views.length) {
    stats.totalVideoViews = views[0].viewsCount;
    stats.totalVideos = views[0].videoCount;
    stats.totalLikes = views[0].totalLikes;
  }
  const subscribers = await Subscription.countDocuments({
    channel: req.user?._id,
  });
  stats.totalSubscribers = subscribers;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { stats }, "All stats has been fetched successfully")
    );
});
const { Types } = mongoose;

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new Types.ObjectId(req.user?._id)  
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "ownerInfo",
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
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        owner: 0,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, { videos }, "All videos are fetched in dashboard successfully")
    );
});

export { getChannelStats, getChannelVideos };
