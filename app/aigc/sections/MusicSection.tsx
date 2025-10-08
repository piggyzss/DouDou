"use client";

import { Headphones, MessageCircle, Play, Pause, Trash2 } from "lucide-react";
import LikeToggle from "../../components/LikeToggle";
import ConfirmModal from "../components/ConfirmModal";
import { useState } from "react";
import Image from "next/image";

export interface MusicTrack {
  id: string;
  title: string;
  tags: string[];
  audioUrl: string;
  coverUrl: string;
  duration: number;
  likes: number;
  comments: number;
  createdAt: string;
}

interface MusicSectionProps {
  tracks: MusicTrack[];
  currentTrackId: string | null;
  setCurrentTrackId: (id: string | null) => void;
  isAudioPlaying: boolean;
  formatDuration: (s: number) => string;
  formatNumber: (n: number) => string;
  formatDate: (d: string) => string;
  onDeleteMusic?: (id: string) => void;
  onUpdateMusicLikes?: (id: string, count: number) => void;
}

export default function MusicSection({
  tracks,
  currentTrackId,
  setCurrentTrackId,
  isAudioPlaying,
  formatDuration,
  formatNumber,
  formatDate,
  onDeleteMusic,
  onUpdateMusicLikes,
}: MusicSectionProps) {
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id: string;
    title: string;
  } | null>(null);

  const playTrack = (track: MusicTrack) => {
    window.dispatchEvent(
      new CustomEvent("music:play", {
        detail: { url: track.audioUrl, id: track.id },
      }),
    );
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <Headphones className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-text-secondary">暂无音乐</p>
        <p className="text-sm text-text-muted mt-2 blog-body-text">
          点击上方按钮创建您的第一首音乐
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 bg-transparent">
      {tracks.map((track) => {
        const isCurrent = currentTrackId === track.id;
        const overlayIcon =
          isCurrent && isAudioPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          );
        return (
          <div
            key={track.id}
            className="flex items-center gap-4 py-4 group hover:bg-gray-50/40 dark:hover:bg-gray-800/40 rounded px-2 transition-colors"
          >
            {/* 封面 */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
              {track.coverUrl ? (
                <Image
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Headphones size={24} className="text-gray-400" />
                </div>
              )}
              <button
                onClick={() => playTrack(track)}
                title={isCurrent && isAudioPlaying ? "暂停" : "播放"}
                className={`absolute inset-0 flex items-center justify-center rounded bg-black/0 group-hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100`}
              >
                <span
                  className={`h-8 w-8 flex items-center justify-center rounded-full bg-primary/80 text-white`}
                >
                  {overlayIcon}
                </span>
              </button>
            </div>

            {/* 标题与标签 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 relative group/title">
                <h3 className="text-base md:text-lg font-heading text-text-primary truncate">
                  {track.title}
                </h3>
                {process.env.NODE_ENV === "development" && onDeleteMusic && (
                  <button
                    onClick={() =>
                      setConfirm({
                        open: true,
                        id: track.id,
                        title: track.title,
                      })
                    }
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="删除音乐"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="mt-1.5 md:mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-text-muted">
                  {formatDate(track.createdAt)}
                </span>
                <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">
                  ·
                </span>
                {track.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-[11px] md:text-xs font-blog"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 右侧统计 */}
            <div className="flex items-center gap-4 ml-2">
              <div className="flex items-center gap-1 text-[11px] text-text-muted">
                <LikeToggle
                  targetType="music"
                  targetId={parseInt(track.id, 10)}
                  initialCount={track.likes}
                  size={14}
                  showCount={true}
                  unlikedColorClass="text-text-muted"
                  likedColorClass="text-red-500"
                  className="text-[11px]"
                  countClassName="text-[11px] leading-none"
                  onChanged={(_, count) => {
                    onUpdateMusicLikes?.(track.id, count);
                  }}
                />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-text-muted">
                <MessageCircle size={14} className="text-text-muted" />
                <span className="leading-none text-text-muted text-[11px]">
                  {formatNumber(track.comments)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {confirm?.open && (
        <ConfirmModal
          isOpen={confirm.open}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (onDeleteMusic && confirm) onDeleteMusic(confirm.id);
            setConfirm(null);
          }}
          title="删除音乐"
          message={`确定要删除 “${confirm?.title}” 吗？此操作不可撤销。`}
          type="danger"
        />
      )}
    </div>
  );
}
