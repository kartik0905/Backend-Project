import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  let likedStatus;
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }
  const isVideoExist = await Video.exists({ _id: videoId });
  if (!isVideoExist) {
    throw new ApiError(404, "Video does not exist");
  }
  const like = await Like.findOne({ likedBy: req.user?.id, video: videoId });
  if (!like) {
    await Like.create({
      likedBy: req.user?._id,
      video: videoId,
    });
    likedStatus = liked;
  } else {
    await like.deleteOne();
    likedStatus = "Unliked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likedStatus },
        `Video has been ${likedStatus.toLowerCase()} successfully`
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment Id required");
  }
  const isCommentIdExist = await Comment.exists({ _id: commentId });
  if (!isCommentExist) {
    throw new ApiError(404, "comment not found with this comment id");
  }

  const like = await Like.findOne({
    likedBy: req.user?.id,
    comment: commentId,
  });

  let likedStatus;

  if (!like) {
    await Like.create({
      likedBy: req.user?.id,
      comment: commentId,
    });
    likedStatus = "Liked";
  } else {
    await like.deleteOne();
    likedStatus = "Unliked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likedStatus },
        `comment has been ${likedStatus.toLowerCase()} successfully`
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet ID required");
  }

  const isTweetExist = await tweetId.exists({ _id: tweetId });
  if (!isTweetExist) {
    throw new ApiError(404, "Tweet not exist");
  }

  const like = await Like.findOne({
    likedBy: req.user?._id,
    tweet: tweetId,
  });

  let likedStatus;

  if (!like) {
    await Like.create({
      likedBy: req.user?._id,
      tweet: tweetId,
    });
    likedStatus = "Liked";
  } else {
    await Like.deleteOne();
    likedStatus = "Unliked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likedStatus },
        `tweet has been ${likedStatus.toLowerCase()} successfully`
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "videoDetails",
      },
    },
    {
      $unwind: {
        path: "$videoDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "videoDetails.owner",
        as: "ownerInfo",
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
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "videoDetails.owner": "$ownerInfo",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$videoDetails",
      },
    },
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedVideos,
      },
      "liked video details has been fetched successfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
