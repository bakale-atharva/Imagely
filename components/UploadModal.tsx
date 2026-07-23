"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { familyId: string; mediaKind: "image" | "video" }) => void;
};

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const createAssetFamily = useMutation(api.assetFamilies.createAssetFamilyWithV1);

  const validateFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return "Invalid file type. Please upload an image or video.";
    }

    if (isImage) {
      const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
      if (!validImageTypes.includes(file.type)) return "Unsupported image format.";
      if (file.size > 20 * 1024 * 1024) return "Image size must be less than 20MB.";
    }

    if (isVideo) {
      const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
      if (!validVideoTypes.includes(file.type)) return "Unsupported video format.";
      if (file.size > 100 * 1024 * 1024) return "Video size must be less than 100MB.";
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    try {
      // 1. Get Auth Params
      const authRes = await fetch(`/api/imagekit/auth?mediaType=${mediaType}`);
      if (!authRes.ok) throw new Error("Failed to get upload authorization");
      const authData = await authRes.json();

      // 2. Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", authData.folder || "/imagely");
      formData.append("token", authData.token);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("publicKey", authData.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("useUniqueFileName", "true");
      formData.append("isPrivateFile", "true");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      interface ImageKitUploadResponse {
        filePath: string;
        fileId: string;
        width?: number;
        height?: number;
      }

      const uploadPromise = new Promise<ImageKitUploadResponse>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            let errorMsg = `Upload failed (${xhr.status})`;
            try {
              const resObj = JSON.parse(xhr.responseText);
              if (resObj.message) errorMsg = resObj.message;
            } catch {
              if (xhr.responseText) errorMsg = xhr.responseText;
            }
            reject(new Error(errorMsg));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload. Please check your connection."));
        xhr.send(formData);
      });

      const res = await uploadPromise;

      // 3. Create Convex Asset Family
      const title = file.name.split(".").slice(0, -1).join(".") || file.name;
      const { familyId } = await createAssetFamily({
        title,
        mediaKind: mediaType,
        imageKitPath: res.filePath,
        imageKitFileId: res.fileId,
        dimensions: { width: res.width || 1920, height: res.height || 1080 },
        editLabel: "V1 Initial Upload",
        recipe: {},
      });

      if (onSuccess) {
        onSuccess({ familyId, mediaKind: mediaType });
      } else {
        router.push(`/editor/${mediaType}?id=${familyId}`);
      }

      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An error occurred during upload.";
      setError(errMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8 space-y-6 flex-1">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Upload Media</h2>
            <p className="text-xs text-slate-400 mt-1">
              Add images or videos to your gallery.
            </p>
          </div>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              relative p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center space-y-4 transition-colors
              ${isDragging ? "border-[#ff6b4a] bg-[#ff6b4a]/5" : "border-slate-800 bg-slate-950/50 hover:border-slate-700"}
              ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/quicktime,video/webm"
            />
            
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[#ff6b4a]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-semibold text-slate-200">
                {isDragging ? "Drop to upload" : "Drag & drop or click to browse"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Images up to 20MB, Videos up to 100MB
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-xs">
              {error}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff6b4a] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
