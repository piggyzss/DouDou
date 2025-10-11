"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { App } from "@/lib/models/app";

interface EditAppData {
  name: string;
  tags: string[];
  description: string;
  type: "app" | "miniprogram" | "game" | "plugin";
  experienceMethod: "download" | "qrcode";
  downloadUrl: string;
  qrCodeImage: File | null;
  status: "development" | "beta" | "online";
  githubUrl?: string;
}

interface EditAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditAppData) => void;
  app: App | null;
}

export default function EditAppModal({
  isOpen,
  onClose,
  onSubmit,
  app,
}: EditAppModalProps) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("app");
  const [status, setStatus] = useState("development");
  const [experienceMethod, setExperienceMethod] = useState("download");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 当app数据变化时，更新表单数据
  useEffect(() => {
    if (app) {
      setName(app.name);
      setTags(app.tags.join(", "));
      setDescription(app.description);
      setType(app.type);
      setStatus(app.status);
      setExperienceMethod(app.experience_method);
      setDownloadUrl(app.download_url || "");
      setGithubUrl(app.github_url || "");
      setQrPreview(app.qr_code_url || "");
    }
  }, [app]);

  if (!isOpen) return null;

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
      const appData: EditAppData = {
        name: name.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        description: description.trim(),
        type: type as "app" | "miniprogram" | "game" | "plugin",
        experienceMethod: experienceMethod as "download" | "qrcode",
        downloadUrl: downloadUrl.trim(),
        qrCodeImage,
        status: status as "development" | "beta" | "online",
        githubUrl: githubUrl.trim() || undefined,
      };
      onSubmit(appData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新App失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-text-primary font-heading">
            编辑App
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入App名称"
              disabled={true}
              required
            />
            <p className="text-xs text-gray-500 mt-1">应用名称不可修改</p>
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "更新中..." : "更新App"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
