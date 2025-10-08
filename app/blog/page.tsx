"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlogModel } from "@/lib/models/blog";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/blog/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载博客失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">
              博客文章
            </h1>
            <p className="text-text-secondary mt-1 font-blog">
              分享技术心得和生活感悟
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">博客页面错误</h1>
            <div className="bg-red-100 p-4 rounded mt-4">
              <p>
                <strong>错误信息:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">
            博客文章
          </h1>
          <p className="text-text-secondary mt-1 font-blog">
            分享技术心得和生活感悟
          </p>
        </div>

        {/* 新建博客按钮 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8">
            <Link
              href="/blog/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-blog"
            >
              <PenSquare size={16} className="mr-2" />
              新建博客
            </Link>
          </div>
        )}

        <AnimatePresence>
          {posts.length > 0 ? (
            <div className="grid gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-text-primary font-heading mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-text-secondary font-blog line-clamp-2">
                            {post.excerpt || post.content?.substring(0, 150) + "..."}
                          </p>
                        </div>
                        {post.cover_url && (
                          <div className="ml-4 flex-shrink-0">
                            <Image
                              src={
                                post.cover_url.startsWith("/")
                                  ? post.cover_url
                                  : `/api/aigc/proxy-image?url=${encodeURIComponent(post.cover_url)}`
                              }
                              alt={post.title}
                              width={120}
                              height={80}
                              className="w-30 h-20 object-cover rounded border border-gray-100 dark:border-gray-700"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-text-muted">
                        <div className="flex items-center space-x-4">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {post.tags.slice(0, 3).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-primary hover:text-primary-dark transition-colors">
                          阅读更多 →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <PenSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-text-secondary">暂无博客</p>
              <p className="text-sm text-text-muted mt-2">
                点击上方按钮创建您的第一篇博客
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}