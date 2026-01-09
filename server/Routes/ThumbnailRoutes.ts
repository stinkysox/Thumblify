import express from "express";
import {
  deleteThumbnail,
  generateThumbnail,
} from "../controllers/ThumbnailController";
import protect from "../Middlewares/Auth";

const ThumbnailRouter = express.Router();

ThumbnailRouter.post("/generate", protect, generateThumbnail);
ThumbnailRouter.delete("/delete/:id", protect, deleteThumbnail);

export default ThumbnailRouter;
