import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import { GenerateContentConfig } from "@google/genai";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import ai from "../configs/ai";
import path from "node:path";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";

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

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio = "16:9",
      color_scheme,
      text_overlay,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    const model = "gemini-3-pro-image-preview";

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspect_ratio,
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };

    let prompt = `Create a ${
      stylePrompts[style as keyof typeof stylePrompts]
    } thumbnail for: "${title}". `;

    if (color_scheme) {
      prompt += `Use a ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      } color scheme. `;
    }

    if (user_prompt) {
      prompt += `Additional details: ${user_prompt}. `;
    }

    prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, bold, professional, and optimized for maximum click-through rate.`;

    const response: any = await ai.models.generateContent({
      model,
      contents: [prompt],
      config: generationConfig,
    });

    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("Invalid AI response");
    }

    let finalBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }

    if (!finalBuffer) {
      throw new Error("No image returned from AI");
    }

    const imagesDir = path.join(process.cwd(), "images");
    const filename = `final-output-${Date.now()}.png`;
    const filePath = path.join(imagesDir, filename);

    // create images directory if it doesn't exist
    fs.mkdirSync(imagesDir, { recursive: true });

    // write image to disk
    fs.writeFileSync(filePath, finalBuffer);

    // upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "thumbnails",
    });

    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;

    await thumbnail.save();

    // cleanup local file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      thumbnail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
};

//controller for thumbnail deletion

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findOneAndDelete({
      _id: id,
      userId,
    });

    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
