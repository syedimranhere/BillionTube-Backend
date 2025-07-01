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
               required: true,
          },
          duration: {
               type: Number, //cloudinary URL
               required: true,
          },
          views: {
               type: String,
               required: true,
               default: 0,
          },
          isPublished: {
               type: Boolean,
               required: true,
               default: true,
          },
          owner: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "user",
               required: true,
          },
     },

     { tmestamps: true }
);

export const video = mongoose.model("video", videoschema);
