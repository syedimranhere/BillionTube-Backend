import mongoose, { Schema } from "mongoose";

const comment_schema = new Schema(
     {
          content: {
               // what is the comment
               type: String,
               required: true,
          },
          video: {
               //which video this comment belongs to
               //this is not entire object,but object id _id
               type: Schema.Types.ObjectId,
               ref: "video",
          },
          owner: {
               //who wrote this comment
               type: Schema.Types.ObjectId,
               ref: "user",
          },
     },
     {
          timestamps: true,
     }
);

//named export
export const comment = mongoose.model("comment", comment_schema);
