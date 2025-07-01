import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userschema = new mongoose.Schema(
     {
          username: {
               type: String,
               required: true,
               unique: true,
               //trim will remove all black space
               trim: true,
               //    if we want to search this, so index must be true
               index: true,
               lowercase: true,
          },
          email: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
          },
          fullname: {
               type: String,
               required: true,
               trim: true,
               index: true,
          },
          avatar: {
               //string because url will comehere
               type: String,
               default: "", // Optional fallback URL
          },
          old_avatar_id:{
               type: String,
               default: "", // Optional fallback URL
          },
          coverimage: {
               type: String,
               default: "", // Optional fallback URL
          },
          old_cover_id:{
               type: String,
               default: "", // Optional fallback URL
          },
          
          password: {
               type: String,
               required: true,
          },
          refreshToken: {
               type: String,
               default: null,
          },
          //history is array of object ids
          //this will be used to store the history of videos watched by the user
          history: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "video",
               },
          ],
     },
     {
          timestamps: true, // Adds createdAt and updatedAt automatically
     }
);


userschema.pre("save", async function (name) {
     //encrypt pass
     if (!this.isModified("password")) {
          return;
     }
     //give em 12 rounds
     //remeber to give me async coz they take time
     this.password = await bcrypt.hash(this.password, 12);
});
//now we'll create our own methods to make cure pass is corrected entered

userschema.methods.generateaccesstoken = function () {
     return jwt.sign(
          {
               //the first param in jwt is payload
               id: this._id,
               //below three are just eg
               username: this.username,
               fullName: this.fullName,
               email: this.email,
          },
          //second param is the token secret
          process.env.ACCESS_TOKEN_SECRET,
          //expiry
          {
               expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
          }
     );
};
userschema.methods.generaterefreshtoken = function () {
     return jwt.sign(
          {
               //the first param in jwt is payload
               //here we have our user ID later used to authenticate
               id: this._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          //expiry
          {
               expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
          }
     );
};

userschema.methods.isPasswordCorrect = async function (pass) {
     //below pass is hashed then compared to hashed pass (this_pass)
     return await bcrypt.compare(pass, this.password);
};

//now everytime user is created or used it will
export const user = mongoose.model("user", userschema);
