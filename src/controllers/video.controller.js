import { Apierror } from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { video} from "../models/video.model.js";
import { uploadcloud } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
     const {
          page = 1,
          limit = 10,
          query,
          sortBy,
          sortType,
          userId,
     } = req.query; //req.query has alot of params ( set by postman or frontend devs)

     const filter ={};
     if(userId){
        filter.owner = userId
     }
     const sortfield = sortBy || "createdAt";
     const sortOrder = sortType === "asc" ? 1 : -1;

     const videos = await video.find(filter)
     .sort({[sortfield]:sortOrder})
   

     return res.status(200).json({
          success: true,
          data: videos,
     })
     //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
     const { title, description } = req.body;

     if (!title) {
          throw new Apierror(400, "Title is required");
     }

     const { videoFile, thumbnail } = req.files;

     if (!videoFile || !thumbnail) {
          throw new Apierror(400, "Video and/or thumbnail is required");
     }

     const videoFilePath = videoFile[0].path;
     const thumbnailPath = thumbnail[0].path;

     if (!videoFilePath || !thumbnailPath) {
          throw new Apierror(400, "Error while uploading files");
     }

     const uploadedVideo = await uploadcloud(videoFilePath);
     const uploadedThumbnail = await uploadcloud(thumbnailPath);

     if (!uploadedVideo || !uploadedThumbnail) {
          throw new Apierror(400, "Error while uploading files to cloud");
     }

     const createdVideo = await video.create({
          videofile: uploadedVideo.url,
          thumbnail: uploadedThumbnail.url,
          title,
          description,
          duration: uploadedVideo.duration,
          views: 0,
          isPublished: true,
          owner: req.user,
     });

     return res.status(200).json({
          message: "Video uploaded successfully",
          success: true,
          data: createdVideo,
     });
});

const getVideoById = asyncHandler(async (req, res) => {
     const vidId = req.params.videoId;
     //TODO: get video by id
     const file  = await video.findById(vidId).select("-_id");

     return res.status(200).json({
        success:true,
        video:file.videofile
     })



});

const updateVideo = asyncHandler(async (req, res) => {
     const { videoId } = req.params;
     //TODO: update video details like title, description, thumbnail
 

     const title =req.body?.title
     const description =req.body?.description
     const tnail = req.file?.path
     if(!title && !description && !tnail){
         return res.status(200).json({
            success:true,
            message:"Nothing updated"
         })
     }
     

     const currVideo = await video.findById(videoId)
     if(!currVideo){
        throw new Apierror(404, "Video Not Found")
     }
     if(title){
        currVideo.title = title
     }
     if(description){
        currVideo.description = description
     
     }
     if(tnail){
        const upload = await uploadcloud(tnail)
        currVideo.thumbnail = upload.url //we always store URL
        
     }
     await currVideo.save()
     
     return res.status(200).json({
          success:true,
          message:"Video Details Updated",
        
     })
});

const deleteVideo = asyncHandler(async (req, res) => {
     const { videoId } = req.params;
     //TODO: delete video

     if (!videoId) {
          throw new Apierror(400, "Video Deleted/Not Found");
     }

     const deleteVid = await video.findByIdAndDelete(videoId);

     return res.status(200).json({
          success: true,
          message: "Video Deleted",
     });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
     const { videoId } = req.params;
     //this was called by the patch method so only the isPub is changed

     const thisVideo = await video.findById(videoId);
     const oldStatus = thisVideo.isPublished;
     const newS= !oldStatus;
     thisVideo.isPublished  = newS
     await thisVideo.save();
     return res.status(200).json({
        sucess:true,
        message:`Toggled from ${oldStatus} --> ${newS}`
     })
});

export {
     getAllVideos,
     publishAVideo,
     getVideoById,
     updateVideo,
     deleteVideo,
     togglePublishStatus,
};
