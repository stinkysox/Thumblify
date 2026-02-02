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
    const {
      title,
      prompt,
      style,
      aspect_ratio = "16:9",
      color_scheme,
    } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Initial DB record
    const thumbnail = await Thumbnail.create({
      userId,
      title: title.trim(),
      prompt_used: prompt,
      style,
      aspect_ratio,
      color_scheme,
      isGenerating: true,
    });
    createdThumbnailId = thumbnail._id.toString();

    // 2. Build the AI prompt (simplified for brevity)
    const aiPrompt = `YouTube thumbnail: "${title}". Style: ${style}. Colors: ${color_scheme}. High impact, 4k.`;

    // 3. Generation with Retry Logic (Fixes 503 & 404)
    let response: any;
    let base64Data: string | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          // Use gemini-2.5-flash-image for production stability
          model: "gemini-2.5-flash-image",
          contents: [{ role: "user", parts: [{ text: aiPrompt }] }],
          config: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: aspect_ratio },
          },
        });

        // 4. Extract base64 image from parts
        base64Data = response?.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData,
        )?.inlineData?.data;

        if (base64Data) break; // Success!
      } catch (err: any) {
        const status = err?.status || err?.error?.code;

        // If 503 (Overloaded), wait and retry
        if (status === 503 && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.warn(`Server overloaded. Retrying in ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }

        // If 404, the model name is likely wrong for your region/tier
        if (status === 404) {
          throw new Error(
            "Model endpoint not found. Please check your API tier.",
          );
        }

        throw err; // Fatal error
      }
    }

    if (!base64Data) throw new Error("AI failed to produce an image part.");

    // 5. Cloudinary Upload
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "thumbnails" },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(Buffer.from(base64Data!, "base64"));
    });

    // 6. Update DB
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.status(200).json({ success: true, thumbnail });
  } catch (error: any) {
    console.error("GENERATE_ERROR:", error);
    if (createdThumbnailId)
      await Thumbnail.findByIdAndDelete(createdThumbnailId);
    return res.status(500).json({ success: false, message: error.message });
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
