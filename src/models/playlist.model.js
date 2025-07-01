import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "video"
        }
    ],
    owner: {
        //only 1 owner
        type: Schema.Types.ObjectId,
        ref: "user"
    },
}, {timestamps: true})



export const playlist = mongoose.model("playlist", playlistSchema)