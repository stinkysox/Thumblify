import React, { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import { type IThumbnail } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

const MyGeneration = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const aspectRatioClassMap: Record<string, string> = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  };

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThumbnails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user/thumbnails");
      const fetchedData = data?.thumbnails || data || [];
      setThumbnails(fetchedData);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast.error(
        error?.response?.data?.message || "Could not load thumbnails"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (image_url: string, id: string) => {
    if (!image_url) return;
    const link = document.createElement("a");
    const downloadUrl = image_url.replace("/upload/", "/upload/fl_attachment/");
    link.href = downloadUrl;
    link.setAttribute("download", `thumbnail-${id}.png`);
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmAction = window.confirm(
        "Are you sure you want to delete this thumbnail?"
      );
      if (confirmAction) {
        const { data } = await api.delete(`/api/thumbnail/delete/${id}`);
        toast.success(data.message || "Deleted successfully");
        setThumbnails((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchThumbnails();
    }
  }, [isLoggedIn]);

  return (
    <div className="overflow-x-hidden">
      <SoftBackdrop />
      <div className="mt-32 min-h-screen px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-200">My Generations</h1>
          <p className="text-sm text-zinc-400 mt-1">
            View and manage your AI generated thumbnails
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-4"></div>
            <p className="text-zinc-400">Loading your creations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && thumbnails.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-zinc-400">
              You haven't generated any thumbnails yet.
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="mt-4 text-pink-500 hover:text-pink-400 transition-colors font-medium"
            >
              Generate your first one &rarr;
            </button>
          </div>
        )}

        {/* Grid Container */}
        {!loading && thumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-6">
            {thumbnails.map((thumb) => {
              const aspectClass =
                aspectRatioClassMap[thumb.aspect_ratio] || "aspect-video";
              const previewUrl = `/preview?thumbnail_url=${encodeURIComponent(
                thumb.image_url || ""
              )}&title=${encodeURIComponent(thumb.title)}`;

              return (
                <div
                  key={thumb._id}
                  onClick={() => navigate(`/generate/${thumb._id}`)}
                  className="mb-6 group relative cursor-pointer rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 shadow-xl break-inside-avoid hover:border-white/20"
                >
                  {/* Image Container */}
                  <div
                    className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-zinc-900`}
                  >
                    {thumb.image_url ? (
                      <img
                        src={thumb.image_url}
                        alt={thumb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500 text-center px-4">
                        {thumb.isGenerating ? "Processing AI..." : "No image"}
                      </div>
                    )}

                    {/* MOBILE-ONLY ACTION PILL (Always Visible on Touch Devices) */}
                    <div className="absolute top-2 right-2 flex md:hidden gap-1 z-20">
                      <div className="bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 flex gap-4 border border-white/20">
                        {/* Download */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(thumb.image_url!, thumb._id);
                          }}
                          className="text-white active:scale-90 transition-transform"
                        >
                          <DownloadIcon size={16} />
                        </button>

                        {/* YouTube Preview */}
                        <Link
                          to={previewUrl}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-white active:scale-90 transition-transform"
                        >
                          <ArrowUpRightIcon size={16} />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(thumb._id);
                          }}
                          className="text-red-400 active:scale-90 transition-transform"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Generating Overlay */}
                    {thumb.isGenerating && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="text-xs text-white font-medium animate-pulse">
                          Generating...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-medium line-clamp-2 text-zinc-100 leading-relaxed">
                      {thumb.title}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400 border border-white/5">
                        {thumb.style}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400 border border-white/5">
                        {thumb.aspect_ratio}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-500">
                      {thumb.createdAt
                        ? new Date(thumb.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {/* DESKTOP-ONLY HOVER BUTTONS */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 hidden md:flex opacity-0 group-hover:opacity-100 gap-2 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
                  >
                    <button
                      onClick={() => handleDelete(thumb._id)}
                      className="p-2 bg-black/70 backdrop-blur-md rounded-lg hover:bg-red-500/80 transition-colors text-white border border-white/10"
                    >
                      <TrashIcon size={18} />
                    </button>

                    <button
                      onClick={() =>
                        handleDownload(thumb.image_url!, thumb._id)
                      }
                      className="p-2 bg-black/70 backdrop-blur-md rounded-lg hover:bg-pink-600 transition-colors text-white border border-white/10"
                    >
                      <DownloadIcon size={18} />
                    </button>

                    <Link
                      target="_blank"
                      to={previewUrl}
                      className="p-2 bg-black/70 backdrop-blur-md rounded-lg hover:bg-pink-600 transition-colors text-white border border-white/10"
                    >
                      <ArrowUpRightIcon size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGeneration;
