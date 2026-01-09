import express from "express";

import {
  getUserThumbnails,
  getThumbnailById,
} from "../controllers/UserController";

const UserRouter = express.Router();

UserRouter.get("/thumbnails", getUserThumbnails);
UserRouter.get("/thumbnail/:id", getThumbnailById);

export default UserRouter;
