"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import BaseModal from "../../components/BaseModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (images: string[]) => void;
  artworkTitle: string;
  artworkTags: string[];
  artworkId: string;
}

export default function AddImageModal({
  isOpen,
  onClose,
  onSubmit,
  artworkTitle,
  artworkTags,
  artworkId,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFiles([]);
    setPreviews([]);
    setIsSubmitting(false);
    setError("");
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    const imageFiles = selected.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      if (!artworkId) throw new Error("缺少作品集ID");
      if (files.length === 0) {
        onSubmit([]);
        onClose();
        return;
      }
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetch(`/api/aigc/artworks/${artworkId}/images`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "上传失败");
      }
      const data = await res.json();
      const uploaded: string[] = data.uploadedFiles || [];
      onSubmit(uploaded);
      resetForm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="添加图片"
      maxWidth="max-w-md"
    >
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-1">
          <div className="text-sm font-body text-text-secondary">
            <span className="text-text-primary">作品集名称：</span>
            <span>{artworkTitle || "-"}</span>
          </div>
          <div className="text-sm font-body text-text-secondary">
            <span className="text-text-primary">标签：</span>
            {artworkTags && artworkTags.length > 0 ? (
              <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
                {artworkTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            ) : (
              <span className="ml-1">-</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-body">
            上传图片
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              点击上传图片
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              支持 JPG, PNG, GIF 等格式
            </p>
          </button>
          {previews.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">
                待上传的图片：
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={src}
                      alt={`预览 ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-3 justify-end mt-4">
          <button
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleSubmit}
            disabled={isSubmitting || files.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                上传中...
              </>
            ) : (
              "完成"
            )}
          </button>
        </div>
    </BaseModal>
  );
}
