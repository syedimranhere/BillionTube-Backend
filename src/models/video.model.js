import mongoose, { Schema } from "mongoose";
const videoschema = new Schema(
  {
    // _id is also present here just we cant see it
    videofile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    //channel name and username are for better results of atlas
    channelNAME: {
      type: String,
    },
    channelUSERNAME: {
      type: String,
    },

    duration: {
      type: Number, //cloudinary URL
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
    },
    visibility: {
      type: String,
      required: true,
      default: "public",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export const video = mongoose.model("video", videoschema);
