import { asyncHandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { user } from "../models/user.model.js";
import { uploadcloud } from "../utils/cloudinary.js";
import {
     usernamevalid,
     testemailvalid,
     isValidFullname,
} from "../utils/username.validate.js";
const defaultCover =
     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLxuhFgsAv71mb5IB16_1YYaSfi9HCTy_lg&s";
// const { username, testemail, isValidFullname };
//register user

// async handler is used for all those fucntions who are aysnc so that we wrap em in a try catch block for safety

export const registerUser = asyncHandler(async (req, res) => {
     //  ** BELOW IS OUR ALGORITHM **
     //    1) first get details form frontend ( via postman)
     //    2) take details and validate em ( not empty)
     //    3) check if already exist (by username or email )
     //    4) take images and avatar and upload em to cloudinary
     //    5) create user in database - create entry in DB
     //    6) response by default has all details of user, but we have to remove password and other sensitive data ( refresh token)
     //    7) now check for user creation  ( if all success send res )

     //we also want to handle files
     // this is the input taking part
     // console.log(req.body);
     const { fullname, email, username, password } = req.body;
     console.log(`
          Email: ${email} , 
          Pass: ${password}
          `);
     if (!email || !password || !fullname || !username) {
          throw new Apierror(400, "All fields are required");
     }
     if (!testemailvalid(email)) {
          throw new Apierror(400, "Invalid email format ❗");
     }
     if (!usernamevalid(username)) {
          throw new Apierror(400, "Invalid username ❗");
     }
     if (!isValidFullname(fullname)) {
          throw new Apierror(400, "Invalid fullname ❗");
     }

     //check if such user exist
     //user.findone is a method that will return a single user
     //if a single user is found so it returns true and hence we throw an error
     //if no user is found it returns false and hence we can proceed
     //if its found entire object is sent

     const userExists = await user.findOne({
          //user will search entire DB thats why await
          //this $or method takes an array of objects
          $or: [{ email }, { username }],
          // $or: [{ email:email }, { username:username }],
     });
     if (userExists) {
          //API error is an obj so thats why we use new Apierror
          throw new Apierror(410, "Username/Email already exists");
     }

     //check for avatar and cover image
     //we are using multer to require our uploads
     // becuase multer has already been configured in our middlewares and stores files
     // multer will get the files in req.files
     // extra ? becuase what if not uploaded

     //!!-- when avatar is sent by user, it has alot of info (.path is one of them) --!!
     //this req.files is coming from multer middleware
     const avatarpath = req.files?.avatar?.[0]?.path;
     //another ? after coverimage
     const coverpath = req.files?.coverimage?.[0]?.path;
     if (!avatarpath) {
          throw new Apierror(420, "Avatar is required ❗");
     }
     if (!coverpath) {
          console.log("Cover image not provided, using default cover image.");
     }

     //now upload them to cloudinary
     //we know upload cloud takes paths hence avatar has path stored in it
     //its imp to wait for cloudinary to upload the file,thats why register user is async
     //in avatar and cover we get a whole object from which we later take url from
     const avatar = await uploadcloud(avatarpath); //NOW avatar has whole object
     if (!avatar) {
          //this is server error
          throw new Apierror(500, "Avatar upload failed ❗");
     }
     //if no path dont upload anything there
     //both uploads return a object
     const cover = coverpath ? await uploadcloud(coverpath) : await uploadcloud(defaultCover);

     //if cover is not uploaded then we set it to null

     console.log(`Avatar uploaded: ${avatarpath}`);
     //user creation takes time so we have to wait for it
     const ourUser = await user.create({
          email,
          //we can access avatar.url becuase cloudinary returns an object with url
          avatar: avatar.url,
          old_avatar_id : avatar.public_id,
          old_cover_id : avatar.cover_id,

          coverimage: cover ? cover.url : defaultCover, //if not it is null
          fullname,
          username, //we are converting username to lowercase
          password,
     });
     //now check if user is created
     //mongo itself assigns an id (_id) to the user when it is created

     //now select what we dont want to send back to the user
     //we dont want to send back password and refresh token
     //finding takes time again so we have to await it
     const confirm = await user
          .findById(ourUser._id)
          .select("-refreshtoken -password");
     //we are selecting the user by id

     //but there are possibilities that user is not created
     if (!confirm) {
          //500 because its a server error
          throw new Apierror(500, "User creation failed ❗");
     }

     //what if its success so for that we have apirespnse
     // we will send back the entire user object (confirm) except password and refresh token
     console.log(`Username: ${confirm.username}`);

     // console.log(req.files);
     return res.status(201).json(
          //entire object here
          new ApiResponse(201, confirm, "User created successfully")
     );
});
