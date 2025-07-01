import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.middleware.js";
import {
     createPlaylist,
     getUserPlaylists,
     getPlaylistById,
     addVideoToPlaylist,
     removeVideoFromPlaylist,
     deletePlaylist,
     updatePlaylist,
} from "../controllers/playlist.controller.js";

const playlistRoute = Router();

playlistRoute.use(isAuthenticated);
playlistRoute.post("/", createPlaylist);
playlistRoute
     .route("/:playlistId")
     .get(getPlaylistById)
     .delete(deletePlaylist)
     .patch(updatePlaylist);

playlistRoute.patch("/add/:videoId/:playlistId", addVideoToPlaylist);
playlistRoute.patch("/remove/:videoId/:playlistId", removeVideoFromPlaylist);
playlistRoute.route("/user/:userId").get(getUserPlaylists);

export { playlistRoute };
