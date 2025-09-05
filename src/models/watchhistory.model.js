import mongoose, { Schema } from "mongoose";

const watchhistory_schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      requried: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },

    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//keep it unique
watchhistory_schema.index({ user: 1, video: 1 }, { unique: true });
export const watchhistory = mongoose.model("watchhistory", watchhistory_schema);
