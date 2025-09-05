import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

      index: true,
    },
    avatar: {
      type: String,
      default:
        "data:image/jpeg;base64,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",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    country: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "Tech",
    },
    passwordUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userschema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userschema.methods.generateaccesstoken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userschema.methods.generaterefreshtoken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userschema.methods.isPasswordCorrect = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

export const user = mongoose.model("user", userschema);
