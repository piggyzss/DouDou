"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface AppData {
  name: string;
  tags: string[];
  description: string;
  coverImage: File | null;
  experienceVideo: File | null;
  type: "app" | "miniprogram" | "game" | "plugin";
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
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setTags("");
    setDescription("");
    setType("app");
    setStatus("development");
    setExperienceMethod("download");
    setDownloadUrl("");
    setCoverImage(null);
    setExperienceVideo(null);
    setQrCodeImage(null);
    setCoverPreview("");
    setVideoPreview("");
    setQrPreview("");
    setError("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExperienceVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrCodeImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setQrPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview("");
  };

  const removeVideo = () => {
    setExperienceVideo(null);
    setVideoPreview("");
  };

  const removeQr = () => {
    setQrCodeImage(null);
    setQrPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const appData: AppData = {
        name,
        tags: tagArray,
        description,
        coverImage,
        experienceVideo,
        type: type as "app" | "miniprogram" | "game" | "plugin",
        experienceMethod: experienceMethod as "download" | "qrcode",
        downloadUrl,
        qrCodeImage,
        status: status as "development" | "beta" | "online",
      };
      onSubmit(appData);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建App失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
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
              required
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
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">应用</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="miniprogram"
                  checked={type === "miniprogram"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">小程序</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="game"
                  checked={type === "game"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">游戏</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="plugin"
                  checked={type === "plugin"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">插件</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              状态
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="development"
                  checked={status === "development"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">开发中</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="beta"
                  checked={status === "beta"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">测试中</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="online"
                  checked={status === "online"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">已上线</span>
              </label>
            </div>
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
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">下载链接</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experienceMethod"
                  value="qrcode"
                  checked={experienceMethod === "qrcode"}
                  onChange={(e) => setExperienceMethod(e.target.value)}
                  className="mr-2 accent-primary"
                  disabled={isSubmitting}
                />
                <span className="font-blog text-xs">二维码</span>
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
                required={experienceMethod === "download"}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传封面图片
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-blog">
                点击上传封面图片
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-blog">
                支持 JPG, PNG, GIF 等格式
              </p>
            </button>
            {coverPreview && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2 font-blog">
                  已上传的封面：
                </h4>
                <div className="relative group">
                  <Image
                    src={coverPreview}
                    alt="封面预览"
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
          {experienceMethod === "qrcode" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-body">
                上传二维码图片
              </label>
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => qrInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-blog">
                  点击上传二维码图片
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-blog">
                  支持 JPG, PNG, GIF 等格式
                </p>
              </button>
              {qrPreview && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-text-primary mb-2 font-blog">
                    已上传的二维码：
                  </h4>
                  <div className="relative group">
                    <Image
                      src={qrPreview}
                      alt="二维码预览"
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={removeQr}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传示例视频
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-blog">
                点击上传示例视频
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-blog">
                支持 MP4, MOV, AVI 等格式
              </p>
            </button>
            {videoPreview && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2 font-blog">
                  已上传的视频：
                </h4>
                <div className="relative group">
                  <video
                    src={videoPreview}
                    className="w-full h-20 object-cover rounded-md"
                    controls
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed"
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
