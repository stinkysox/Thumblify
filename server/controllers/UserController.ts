import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";

// controller to get all thumbnails of the logged-in user
export const getUserThumbnails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const thumbnails = await Thumbnail.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ thumbnails });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// controller to get a single thumbnail of the user
export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const thumbnail = await Thumbnail.findOne({
      _id: id,
      userId,
    });

    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    res.status(200).json({ thumbnail });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
