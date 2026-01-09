import express from "express";

import {
  getUserThumbnails,
  getThumbnailById,
} from "../controllers/UserController";
import protect from "../Middlewares/Auth";

const UserRouter = express.Router();

UserRouter.get("/thumbnails", protect, getUserThumbnails);
UserRouter.get("/thumbnail/:id", protect, getThumbnailById);

export default UserRouter;
