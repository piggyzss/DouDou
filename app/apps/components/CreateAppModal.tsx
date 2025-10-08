"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface AppData {
  name: string;
  tags: string[];
  description: string;
  type: "app" | "tool";
  experienceMethod: "download" | "qrcode";
  downloadUrl: string;
  qrCodeImage: File | null;
  status: "development" | "beta" | "online";
}

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppData) => void;
}

export default function CreateAppModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAppModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("app");
  const [status, setStatus] = useState("development");
  const [experienceMethod, setExperienceMethod] = useState("download");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [experienceVideo, setExperienceVideo] = useState<File | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [qrPreview, setQrPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExperienceVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const appData: AppData = {
        name: name.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        description: description.trim(),
        type: type as "app" | "tool",
        experienceMethod: experienceMethod as "download" | "qrcode",
        downloadUrl: downloadUrl.trim(),
        qrCodeImage,
        status: status as "development" | "beta" | "online",
      };
      onSubmit(appData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建App失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">
          新建App
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              App名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入App名称"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入标签，用逗号分隔"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              简介
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入App简介"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="app"
                  checked={type === "app"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                应用
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="tool"
                  checked={type === "tool"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                工具
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              状态
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              disabled={isSubmitting}
            >
              <option value="development">开发中</option>
              <option value="beta">测试版</option>
              <option value="online">已上线</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              体验方式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experienceMethod"
                  value="download"
                  checked={experienceMethod === "download"}
                  onChange={(e) => setExperienceMethod(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                下载
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experienceMethod"
                  value="qrcode"
                  checked={experienceMethod === "qrcode"}
                  onChange={(e) => setExperienceMethod(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                二维码
              </label>
            </div>
          </div>

          {experienceMethod === "download" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-body">
                下载链接
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                placeholder="请输入下载链接"
                disabled={isSubmitting}
              />
            </div>
          )}

          {experienceMethod === "qrcode" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-body">
                二维码图片
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeChange}
                  className="hidden"
                  id="qrCodeUpload"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="qrCodeUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {qrPreview ? (
                    <Image
                      src={qrPreview}
                      alt="二维码预览"
                      width={100}
                      height={100}
                      className="max-h-24 object-contain"
                    />
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        点击上传二维码
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  创建中...
                </>
              ) : (
                "完成"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
