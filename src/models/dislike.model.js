import mongoose, { Schema } from "mongoose";

const dislikeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },

    //ofcourse current user will like
    dislikedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const dislike = mongoose.model("dislike", dislikeSchema);
