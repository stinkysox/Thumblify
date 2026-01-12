import React from "react";
import { Download, Image, Loader2 } from "lucide-react";

type AspectRatio = "16:9" | "1:1" | "9:16";
interface IThumbnail {
  _id?: string;
  image_url?: string;
  title?: string;
}

interface PreviewPanelProps {
  thumbnail: IThumbnail | null;
  isLoading: boolean;
  aspectRatio: AspectRatio;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  thumbnail,
  isLoading,
  aspectRatio,
}) => {
  const aspectClasses = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  } as Record<AspectRatio, string>;

  const onDownload = () => {
    if (!thumbnail?.image_url) return;
    const link = document.createElement("a");
    const downloadUrl = thumbnail.image_url.replace(
      "/upload/",
      "/upload/fl_attachment/"
    );
    link.href = downloadUrl;
    link.setAttribute(
      "download",
      `thumbnail-${thumbnail._id || "download"}.png`
    );
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full mx-auto max-w-2xl">
      <div
        className={`relative overflow-hidden rounded-xl bg-zinc-900/50 border border-white/5 ${aspectClasses[aspectRatio]}`}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
            <Loader2 className="animate-spin size-8 text-pink-500" />
            <div className="text-center">
              <p className="text-white font-medium">AI is generating...</p>
              <p className="text-white/60 text-xs mt-1">
                This takes about 10-20 seconds
              </p>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {!isLoading && thumbnail?.image_url && (
          <div className="group relative h-full w-full">
            <img
              src={thumbnail.image_url}
              alt={thumbnail.title || "Thumbnail preview"}
              className="h-full w-full object-cover"
            />

            {/* Desktop Hover Overlay (Hidden on Mobile) */}
            <div className="absolute inset-0 hidden md:flex items-end justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={onDownload}
                className="mb-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition bg-white text-black hover:bg-zinc-200"
              >
                <Download size={18} />
                Download Thumbnail
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !thumbnail?.image_url && (
          <div className="absolute inset-0 m-2 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/10">
            <Image className="size-10 text-white/20" />
            <div className="px-4 text-center">
              <p className="text-sm text-zinc-400">
                Your preview will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Only Action Bar (Always Visible when image exists) */}
      {!isLoading && thumbnail?.image_url && (
        <div className="mt-4 flex md:hidden flex-col gap-3">
          <button
            onClick={onDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-bold text-black shadow-lg active:scale-[0.98] transition-transform"
          >
            <Download size={20} />
            Download Image
          </button>
          <p className="text-center text-xs text-zinc-500">
            Long-press the image to save directly to photos
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
