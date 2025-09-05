import mongoose, { Schema } from "mongoose";

const comment_schema = new Schema(
  {
    content: {
      // what is the comment
      type: String,
      required: true,
    },
    video: {
      //which video is this comment for
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    owner: {
      //who wrote this comment
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//named export
export const comment = mongoose.model("comment", comment_schema);
