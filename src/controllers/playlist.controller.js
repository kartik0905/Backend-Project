import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/APIErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!(name?.trim() || description?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const newPlaylist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: newPlaylist },
        "new playlist has been created successfully"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User ID required");
  }

  const isUserExist = await User.exists({ _id: userId });
  if (!isUserExist) {
    throw new ApiError(404, "User with give Id does not exist");
  }

  const userPlaylists = await Playlist.find({ owner: userId })
    .select("name description videos createdAt updatedAt")
    .lean()
    .sort({ createdAt: -1 });
  const playlistWithVideoCount = userPlaylists.map((pl) => ({
    ...pl,
    videoCount: pl.videos.length,
  }));
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlists: playlistWithVideoCount },
        "user playlists has been fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id required");
  }
  const isPlaylistExist = await Playlist.exists({ _id: playlistId });
  if (!isPlaylistExist) {
    throw new ApiError(404, "Playlist does not exist");
  }
  const { Types } = mongoose;

  const playlistVideos = await Playlist.aggregate([
    {
      $match: {
        _id: Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "videos",
        as: "playlistVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "owner",
              as: "videoOwner",
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
              path: "$videoOwner",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              owner: "$videoOwner",
            },
          },
          {
            $project: {
              videoOwner: 0,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "playlistOwner",
      },
    },
    {
      $unwind: {
        path: "$playlistOwner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        videoCount: {
          $size: "$playlistVideos",
        },
        playlistUsername: "$playlistOwner.username",
        playlistFullName: "$playlistOwner.fullName",
        playlistAvatar: "$playlistOwner.avatar",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        playlistUsername: 1,
        playlistFullName: 1,
        playlistAvatar: 1,
        playlistVideos: 1,
        videoCount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!playlistVideos.length) {
    throw new ApiError(404, "Playlist is missing");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: playlistVideos[0] },
        "all the videos with their owner of playlist has been fetched successfully"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "video and playlist id both are required");
  }
  const isVideoExist = await Video.exists({ _id: videoId });
  if (!isVideoExist) {
    throw new ApiError(404, "video to be added does not exist");
  }

  const existingPlaylist = await Playlist.findById(playlistId);
  if (!existingPlaylist) {
    throw new ApiError(404, "playlist not found");
  }
  if (String(req.user?._id) !== String(existingPlaylist.owner)) {
    throw new ApiError(403, "user unauthorized to perform this action");
  }

  if (!existingPlaylist.videos.includes(videoId)) {
    existingPlaylist.videos.push(videoId);
  }
  await existingPlaylist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: existingPlaylist },
        "video has beend added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (String(req.user?.id) !== String(playlist.owner)) {
    throw new ApiError(403, "unauthorized to perform video removal acion");
  }

  const videos = Playlist.videos.filter((vd) => String(vd) !== String(videoId));
  playlist.videos = videos;
  await playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "Video removed from playlist succesfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found or already deleted");
  }
  if (String(req.user?.id) !== String(playlist.owner)) {
    throw new ApiError(403, "unauthorized to perform delete playlist action");
  }
  await playlist.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist has been deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (String(req.user?.id) !== String(playlist.owner)) {
    throw new ApiError(403, "unauthorized to perform update playlist action");
  }
  if (!name?.trim() && !description?.trim()) {
    throw new ApiError(400, "any one of the name and description must exist");
  }
  playlist.name = name?.trim() || playlist.name;
  playlist.description = description?.trim() || playlist.description;
  await playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "Playlist has been updated successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
