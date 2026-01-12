import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import { GenerateContentConfig } from "@google/genai";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import ai from "../configs/ai";
import { v2 as cloudinary } from "cloudinary";

/* ---------------- STYLE PROMPTS ---------------- */

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

/* ---------------- COLOR SCHEMES ---------------- */

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

/* ---------------- GENERATE THUMBNAIL ---------------- */

export const generateThumbnail = async (req: Request, res: Response) => {
  let createdThumbnailId: string | null = null;

  try {
    const { userId } = req.session as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio = "16:9",
      color_scheme,
    } = req.body;

    // 1. Create the placeholder record
    const thumbnail = await Thumbnail.create({
      userId,
      title: title.trim(),
      prompt_used: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      isGenerating: true,
    });

    createdThumbnailId = thumbnail._id;

    // 2. Build the AI Prompt
    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || "";
    const colorDesc =
      colorSchemeDescriptions[
        color_scheme as keyof typeof colorSchemeDescriptions
      ] || "";

    const aiPrompt = `Create a ${stylePrompt} thumbnail for "${title}". ${
      colorDesc ? `Use a ${colorDesc} color scheme.` : ""
    } ${
      user_prompt ? `Details: ${user_prompt}.` : ""
    } The thumbnail should be ${aspect_ratio}, professional, and high-impact.`;

    // 3. Request Image from Gemini
    const response: any = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [aiPrompt],
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: aspect_ratio, imageSize: "1K" },
        // ... safetySettings from your previous code
      },
    });

    // 4. Extract Image Data
    const base64Data = response?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData?.data;

    if (!base64Data) {
      throw new Error(
        "AI Safety Filter blocked this request or no image returned."
      );
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    // 5. Upload to Cloudinary via Stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "thumbnails" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(imageBuffer);
    });

    // 6. Finalize DB Record
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.status(200).json({
      success: true,
      thumbnail,
    });
  } catch (error: any) {
    console.error("GENERATE_ERROR:", error.message);

    // CLEANUP: If we created a DB record but the AI/Cloudinary failed, delete it.
    if (createdThumbnailId) {
      await Thumbnail.findByIdAndDelete(createdThumbnailId);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate thumbnail",
    });
  }
};
/* ---------------- DELETE THUMBNAIL ---------------- */

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session as any;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
