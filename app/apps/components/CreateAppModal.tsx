"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BaseModal from "../../components/BaseModal";

interface AppData {
  name: string;
  tags: string[];
  description: string;
  type: "app" | "miniprogram" | "game" | "plugin";
  experienceMethod: "download" | "qrcode";
  downloadUrl: string;
  coverImage: File | null;
  experienceVideo: File | null;
  qrCodeImage: File | null;
  status: "development" | "beta" | "online";
  githubUrl?: string;
}

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appData: AppData) => void;
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
  const [githubUrl, setGithubUrl] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [experienceVideo, setExperienceVideo] = useState<File | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [qrPreview, setQrPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
        type: type as "app" | "miniprogram" | "game" | "plugin",
        experienceMethod: experienceMethod as "download" | "qrcode",
        downloadUrl: downloadUrl.trim(),
        coverImage,
        experienceVideo,
        qrCodeImage,
        status: status as "development" | "beta" | "online",
        githubUrl: githubUrl.trim() || undefined,
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="新建App"
      maxWidth="max-w-md"
    >
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
              封面图片 <span className="text-gray-400 text-xs">(可选)</span>
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                id="coverImageUpload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="coverImageUpload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="封面预览"
                    width={200}
                    height={100}
                    className="max-h-24 object-contain"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs font-blog text-gray-500">
                      点击上传封面图片
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              体验视频 <span className="text-gray-400 text-xs">(可选)</span>
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="videoUpload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="videoUpload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    className="max-h-24 object-contain"
                    controls
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs font-blog text-gray-500">
                      点击上传体验视频
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              GitHub仓库地址 <span className="text-gray-400 text-xs">(可选)</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="https://github.com/username/repository"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center text-xs font-blog">
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
              <label className="flex items-center text-xs font-blog">
                <input
                  type="radio"
                  name="type"
                  value="miniprogram"
                  checked={type === "miniprogram"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                小程序
              </label>
              <label className="flex items-center text-xs font-blog">
                <input
                  type="radio"
                  name="type"
                  value="game"
                  checked={type === "game"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                游戏
              </label>
              <label className="flex items-center text-xs font-blog">
                <input
                  type="radio"
                  name="type"
                  value="plugin"
                  checked={type === "plugin"}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                插件
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-blog text-xs bg-white dark:bg-gray-700 text-text-primary dark:text-white"
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
              <label className="flex items-center text-xs font-blog">
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
              <label className="flex items-center text-xs font-blog">
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
                      <span className="text-xs font-blog text-gray-500">
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
    </BaseModal>
  );
}
