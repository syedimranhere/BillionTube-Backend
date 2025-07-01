import mongoose, { Schema } from "mongoose";

const subscription_schema = new Schema(
     {
          // !! basically both are users !!
          //id is always given my mongoDb
          subscriber: {
               type: Schema.Types.ObjectId, //the one who is subscribing
               ref: "user",
          },
          channel: {
               type: Schema.Types.ObjectId, //jisko subscribe karrhe hain
               ref: "user",
          },
     },
     {
          timestamps: true,
     }
);
export const subscription = mongoose.model("subscription", subscription_schema);
