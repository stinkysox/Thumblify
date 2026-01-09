import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  colorSchemes,
  dummyThumbnails,
  type AspectRatio,
  type IThumbnail,
  type ThumbnailStyle,
} from "../assets/assets";
import SoftBackdrop from "../components/SoftBackdrop";
import AspectRationSelector from "../components/AspectRationSelector";
import StyleSelector from "../components/StyleSelector";
import ColorSchemeSelector from "../components/ColorSchemeSelector";
import PreviewPanel from "../components/previewPanel";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../configs/api";

const Generate = () => {
  const { id } = useParams<{ id?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [title, setTitle] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [colorSchemeId, setColorSchemeId] = useState<string>(
    colorSchemes[0].id
  );
  const [style, setStyle] = useState<ThumbnailStyle>("Bold and Graphic");

  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      return toast.error("please login to generate thumbnails");
    }
    if (!title.trim()) {
      return toast.error("Title is required");
      setLoading(true);
    }

    const api_payload = {
      title,
      prompt: additionalDetails,
      style,
      aspect_ratio: aspectRatio,
      color_scheme: colorSchemeId,
      text_overlay: true,
    };

    const { data } = await api.post("/api/thumbnail/generate", api_payload);
    if (data.thumbnail) {
      navigate("/generate/" + data.thumbnail._id);
      toast.success(data.message);
    }
  };

  const fetchThumbnail = async () => {
    try {
      const { data } = await api.get(`/api/user/thumbnail/${id}`);
      setThumbnail(data?.thumbnail as IThumbnail);
      setLoading(!data?.thumbnail?.image_url);
      setAdditionalDetails(data?.thumbnail?.user_prompt);
      setColorSchemeId(data?.thumbnail?.color_scheme);
      setAspectRatio(data?.thumbnail?.aspect_ratio);
      setStyle(data?.thumbnail?.style);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if ((isLoggedIn, id)) {
      fetchThumbnail();
    }
  }, [id]);

  return (
    <>
      <SoftBackdrop />
      <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          {/* Two column layout: Left panel (form) and Right panel (preview) */}
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left Panel - Thumbnail Generation Form */}
            <div className={`space-y-6 ${id ? "pointer-events-none" : ""}`}>
              {/* Form Container */}
              <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
                {/* Header Section */}
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 mb-1">
                    Create your Thumbnail
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Describe your vision and let AI bring it to life
                  </p>
                </div>

                {/* Form Fields Section */}
                <div className="space-y-5">
                  {/* Title Input Field */}
                  <div className="space-y-2">
                    <label htmlFor="" className="text-sm font-medium">
                      Title or Topic
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., 10 tips for better sleep"
                      className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    {/* Character Counter */}
                    <div className="flex justify-end">
                      <span className="text-xs text-zinc-400">
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Aspect Ratio Selector */}
                  <AspectRationSelector
                    value={aspectRatio}
                    onChange={setAspectRatio}
                  />

                  {/* Style Selector Dropdown */}
                  <StyleSelector
                    value={style}
                    onChange={setStyle}
                    isOpen={styleDropdownOpen}
                    setIsOpen={setStyleDropdownOpen}
                  />

                  {/* Color Scheme Selector */}
                  <ColorSchemeSelector
                    value={colorSchemeId}
                    onChange={setColorSchemeId}
                  />

                  {/* Additional Details Textarea */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Additional Prompts{" "}
                      <span className="text-zinc-400 text-xs">Optional</span>
                    </label>
                    <textarea
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={3}
                      placeholder="add any specific elements, mood, or style prefernces..."
                      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                  </div>
                </div>

                {/* Generate Button - Only show when not viewing existing thumbnail */}
                {!id && (
                  <button
                    onClick={handleGenerate}
                    className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-gradient-to-b from-pink-500 to-pink-600 transition-colors hover:from-pink-600 hover:to-pink-700 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Thumbnail"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Preview Section */}
            <div>
              {/* Preview Container */}
              <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
                <h2 className="text-lg font-semibold text-zinc-100">Preview</h2>
                {/* Preview Panel Component */}
                <PreviewPanel
                  thumbnail={thumbnail}
                  isLoading={loading}
                  aspectRatio={aspectRatio}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Generate;
