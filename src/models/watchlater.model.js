import mongoose, { Schema } from "mongoose";

const watchlater_schema = new Schema(
  {
    // !! basically both are users !!
    //id is always given my mongoDb
    user: {
      type: Schema.Types.ObjectId, //the one who is subscribing
      ref: "user",
      requried: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId, //jisko subscribe karrhe hain
        ref: "video",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const watchlater = mongoose.model("watchlater", watchlater_schema);
