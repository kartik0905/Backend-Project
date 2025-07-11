import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/APIErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Enter the videoId for comment");
  }

  const isVideoIdExist = await Video.exists({ _id: videoId });
  if (!isVideoIdExist) {
    throw new ApiError(404, "Provided VideoId Does not exist");
  }
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const { Types } = mongoose;

  const paginatedVideoComments = await Comment.aggregatePaginate(
    Comment.aggregate([
      {
        $match: {
          video: Types.ObjectId(videoId), 
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "owner",
          as: "CommentUser",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$CommentUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          username: "$CommentUser.username",
          avatar: "$CommentUser.avatar",
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          username: 1,
          avatar: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]),
    options
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments: paginatedVideoComments },
        "paginated video comments are fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }
  const isVideoExist = await Video.exists({ _id: videoId });
  if (!isVideoExist) {
    throw new ApiError(404, "video not found with this video id");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "comment content is missing and required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: user not found in request");
  }
  const newComment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: newComment },
        "New comment has been added successfully"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "comment id is missing");
  }

  const existingComment = await Comment.findById(commentId);

  if (!existingComment) {
    throw new ApiError(404, "Comment not found");
  }

  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "comment must not be blank");
  }

  existingComment.content = content.trim();
  await existingComment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: existingComment },
        "Comment has been updated Successfully"
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is missing");
  }
  const comment = await Comment.findById(commentId).populate("video");
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (
    !comment.owner.equals(req.user?._id) &&
    !comment.video?.owner.equals(req.user?._id)
  ) {
    throw new ApiError(402, "User Unauthorized to perform this action");
  }
  await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment is deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
