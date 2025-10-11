"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

const PRIMARY_BTN =
  "inline-flex items-center px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-60 transition-colors font-blog text-sm shadow-sm";
const SECONDARY_BTN =
  "inline-flex items-center px-4 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors font-blog text-sm shadow-sm";

export default function EditBlogPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 封面上传
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const data = json.data || {};
        setTitle(data.title || "");
        setTags(Array.isArray(data.tags) ? data.tags.join(",") : "");
        setContent(data.content || "");
        // 初始化封面预览
        if (data.cover_url) setCoverPreview(data.cover_url);
      } catch (e: any) {
        setError(e.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return null;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", coverFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("封面上传失败");
      const json = await res.json();
      return json.url as string;
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);

      let cover_url: string | null = null;
      if (coverFile) {
        cover_url = await uploadCover();
      }

      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 标题不允许修改，不传递 title
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          content,
          ...(cover_url ? { cover_url } : {}),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(`/blog/${slug}`);
    } catch (e: any) {
      setError(e.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-8 text-text-secondary font-blog">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-4 font-blog">
          编辑博客
        </h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={save}
              disabled={saving || uploading}
              className={PRIMARY_BTN}
            >
              {saving ? "保存中..." : uploading ? "上传封面中..." : "保存"}
            </button>
            <button
              onClick={() => router.push(`/blog/${slug}`)}
              className={SECONDARY_BTN}
            >
              取消
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm font-blog">{error}</div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">
              标题（编辑状态不可修改）
            </label>
            <input
              value={title}
              disabled
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-secondary outline-none font-blog"
            />
          </div>

          {/* 封面上传，与新建页一致 */}
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">
              封面图片
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCoverFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setCoverPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </button>
              {coverFile && (
                <span className="text-sm text-text-secondary font-blog">
                  {coverFile.name}
                </span>
              )}
            </div>
            {coverPreview && (
              <div className="mt-2">
                <Image
                  src={
                    coverPreview.startsWith("data:") ||
                    coverPreview.startsWith("/") ||
                    coverPreview.startsWith("/api/aigc/proxy-image")
                      ? coverPreview
                      : `/api/aigc/proxy-image?url=${encodeURIComponent(coverPreview)}`
                  }
                  alt="封面预览"
                  width={192}
                  height={128}
                  className="w-48 h-32 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">
              标签 (逗号分隔)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary font-blog"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">
              内容 (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
