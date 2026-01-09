import React from "react";
import {
  Sparkles,
  Square,
  PenTool,
  Cpu,
  ChevronDown,
  Palette,
} from "lucide-react";

// Mock thumbnailStyles since it's imported from external file
const thumbnailStyles = [
  "Bold and Graphic",
  "Minimalist",
  "Photorealistic",
  "Tech/Futuristic",
  "Illustrated",
] as const;
type ThumbnailStyle = (typeof thumbnailStyles)[number];

const StyleSelector = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
}: {
  value: ThumbnailStyle;
  onChange: (style: ThumbnailStyle) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const styleDescription: Record<ThumbnailStyle, string> = {
    "Bold and Graphic":
      "Vibrant colors, strong contrasts, and clear typography.",
    Minimalist: "Clean design with ample white space and simple elements.",
    Photorealistic: "Realistic representation of objects and scenes.",
    "Tech/Futuristic": "High-tech visuals with futuristic elements.",
    Illustrated: "Hand-drawn and creative artwork with artistic flair.",
  };

  const styleIcons: Record<ThumbnailStyle, React.ReactNode> = {
    "Bold and Graphic": <Sparkles className="h-5 w-5" />,
    Minimalist: <Square className="h-5 w-5" />,
    Photorealistic: <PenTool className="h-5 w-5" />,
    "Tech/Futuristic": <Cpu className="h-5 w-5" />,
    Illustrated: <Palette className="h-5 w-5" />,
  };

  return (
    <div className="relative w-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Thumbnail Style
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition bg-white/8 border-white/10 text-zinc-200 hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            {styleIcons[value]}
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-zinc-400">
                {styleDescription[value]}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-zinc-900 shadow-lg">
          {thumbnailStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => {
                onChange(style);
                setIsOpen(false);
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/10 first:rounded-t-md last:rounded-b-md"
            >
              <div className="pt-0.5">{styleIcons[style]}</div>
              <div>
                <div className="font-medium text-zinc-200">{style}</div>
                <div className="text-sm text-zinc-400">
                  {styleDescription[style]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
