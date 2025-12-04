"use client";

import { App } from "@/lib/models/app";
import { motion } from "framer-motion";
import { CircleOff, RotateCcw, SquareCode } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { useMobileEventFix } from "../hooks/useMobileEventFix";
import AppCard from "./components/AppCard";
import CreateAppModal from "./components/CreateAppModal";
import EditAppModal from "./components/EditAppModal";
import FilterBar from "./components/FilterBar";

export default function AppsPage() {
  // 使用移动端事件修复Hook
  useMobileEventFix();
  
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    app: App | null;
  }>({ open: false, app: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV === "development";

  // 获取应用列表
  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/apps?status=online");
      if (!response.ok) {
        throw new Error("获取应用列表失败");
      }
      const data = await response.json();
      setApps(data.apps);
      setFilteredApps(data.apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取应用列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchApps();
  }, []);

  const handleFilter = (type: string) => {
    setSelectedType(type);
    filterApps(type);
  };

  const filterApps = (type: string) => {
    let filtered = apps;

    // 类型过滤
    if (type !== "all") {
      filtered = filtered.filter((app) => app.type === type);
    }

    setFilteredApps(filtered);
  };

  const handleCreateApp = async (appData: any) => {
    try {
      const formData = new FormData();

      // 添加基本字段
      formData.append("name", appData.name);
      formData.append("description", appData.description);
      formData.append("tags", appData.tags.join(","));
      formData.append("type", appData.type);
      formData.append("platform", appData.platform || "web");
      formData.append("status", appData.status);
      formData.append("experience_method", appData.experienceMethod);

      if (appData.downloadUrl) {
        formData.append("download_url", appData.downloadUrl);
      }

      if (appData.coverImage) {
        formData.append("cover_image", appData.coverImage);
      }

      if (appData.experienceVideo) {
        formData.append("video", appData.experienceVideo);
      }

      if (appData.qrCodeImage) {
        formData.append("qr_code_image", appData.qrCodeImage);
      }

      if (appData.githubUrl) {
        formData.append("github_url", appData.githubUrl);
      }

      const response = await fetch("/api/apps", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("创建应用失败");
      }

      // 重新获取应用列表
      await fetchApps();
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建应用失败");
    }
  };

  const handleEditApp = (app: App) => {
    setEditingApp(app);
    setIsEditModalOpen(true);
  };

  const handleUpdateApp = async (appData: any) => {
    if (!editingApp) return;

    try {
      const formData = new FormData();

      // 添加基本字段
      formData.append("description", appData.description);
      formData.append("tags", appData.tags.join(","));
      formData.append("type", appData.type);
      formData.append("status", appData.status);
      formData.append("experience_method", appData.experienceMethod);

      if (appData.downloadUrl) {
        formData.append("download_url", appData.downloadUrl);
      }

      if (appData.coverImage) {
        formData.append("cover_image", appData.coverImage);
      }

      if (appData.experienceVideo) {
        formData.append("video", appData.experienceVideo);
      }

      if (appData.qrCodeImage) {
        formData.append("qr_code_image", appData.qrCodeImage);
      }

      if (appData.githubUrl) {
        formData.append("github_url", appData.githubUrl);
      }

      const response = await fetch(`/api/apps/${editingApp.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("更新应用失败");
      }

      // 重新获取应用列表
      await fetchApps();
      setIsEditModalOpen(false);
      setEditingApp(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新应用失败");
    }
  };

  const handleDeleteApp = (app: App) => {
    setDeleteConfirm({ open: true, app });
  };

  const confirmDeleteApp = async () => {
    if (!deleteConfirm.app) return;

    try {
      const response = await fetch(`/api/apps/${deleteConfirm.app.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除应用失败");
      }

      // 重新获取应用列表
      await fetchApps();
      setDeleteConfirm({ open: false, app: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除应用失败");
    }
  };

  return (
    <div className="min-h-screen pt-16 page-content mobile-safe-area">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 - 类似博客页面样式 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">
            App开发
          </h1>
          <p className="text-text-secondary mt-1 font-blog">做点有意思的</p>
        </div>

        {/* 新建App按钮 - 仅在开发模式下显示 */}
        {isDev && (
          <div className="mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              <SquareCode size={16} className="mr-2" />
              新建App
            </button>
          </div>
        )}

        {/* 筛选栏 */}
        <div className="mb-8">
          <FilterBar onFilter={handleFilter} selectedType={selectedType} />
        </div>

        {/* 错误状态 */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="flex items-center justify-center gap-3">
              <CircleOff size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-text-secondary text-sm font-blog">{error}</p>
            </div>
            <button
              onClick={fetchApps}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-blog text-sm"
            >
              <RotateCcw size={16} />
              重试
            </button>
          </motion.div>
        )}

        {/* 加载状态 */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-muted mt-4">加载中...</p>
          </motion.div>
        )}

        {/* 作品展示区域 */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {filteredApps.map((app, index) => (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <AppCard 
                  app={app} 
                  onEdit={handleEditApp}
                  onDelete={handleDeleteApp}
                />
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && !error && filteredApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <SquareCode className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-text-secondary">暂无应用</p>
            {isDev && (
              <p className="text-sm text-text-muted mt-2 font-blog">
                点击上方按钮创建您的第一个应用
              </p>
            )}
          </motion.div>
        )}

        {/* 新建App弹窗 */}
        {isCreateModalOpen && (
          <CreateAppModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateApp}
          />
        )}

        {/* 编辑App弹窗 */}
        {isEditModalOpen && editingApp && (
          <EditAppModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingApp(null);
            }}
            onSubmit={handleUpdateApp}
            app={editingApp}
          />
        )}

        {/* 删除确认弹窗 */}
        {deleteConfirm.open && deleteConfirm.app && (
          <ConfirmModal
            isOpen={deleteConfirm.open}
            onClose={() => setDeleteConfirm({ open: false, app: null })}
            onConfirm={confirmDeleteApp}
            title="删除应用"
            message={`确定要删除应用 "${deleteConfirm.app.name}" 吗？此操作不可撤销。`}
            type="danger"
          />
        )}
      </div>
    </div>
  );
}
