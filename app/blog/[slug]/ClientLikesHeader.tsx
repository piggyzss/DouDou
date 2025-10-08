"use client";

import { useEffect, useState } from "react";
import LikeToggle from "../../components/LikeToggle";

type Tag = { name: string; slug: string };

export default function ClientLikesHeader({
  likes,
  publishedAt,
  createdAt,
  tags,
  postId,
}: {
  likes: number;
  publishedAt?: string;
  createdAt: string;
  tags: Tag[];
  postId: number;
}) {
  const [count, setCount] = useState(likes);

  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail;
      if (d?.targetType === "blog" && d?.targetId === postId) {
        setCount(d.count);
      }
    };
    window.addEventListener("like:changed", handler as any);
    return () => window.removeEventListener("like:changed", handler as any);
  }, [postId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="my-3 flex items-center gap-2 text-text-muted text-[11px]">
      <time className="leading-none">
        {formatDate(publishedAt || createdAt)}
      </time>
      <span className="inline-flex items-center justify-center align-middle leading-none translate-y-[2px] mx-0.5">
        ·
      </span>
      <div className="flex flex-wrap gap-1">
        {tags.map((t: Tag) => (
          <span
            key={t.slug}
            className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
          >
            #{t.name}
          </span>
        ))}
      </div>
      <span className="inline-flex items-center justify-center align-middle leading-none translate-y-[2px] mx-0.5">
        ·
      </span>
      <LikeToggle
        targetType="blog"
        targetId={postId}
        initialCount={count}
        size={14}
        showCount={true}
        className="text-[11px]"
        countClassName="text-[11px] leading-none"
        unlikedColorClass="text-text-muted"
        likedColorClass="text-red-500"
        onChanged={(_, c) => setCount(c)}
      />
    </div>
  );
}
