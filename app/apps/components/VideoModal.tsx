"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
  Hand,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
}

function VideoModal({ videoUrl, title, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volOpen, setVolOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const onLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    setDuration(el.duration || 0);
    setCurrentTime(el.currentTime || 0);
  };

  const onTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime || 0);
  };

  const onSeekByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const percent = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    el.currentTime = percent * duration;
    setCurrentTime(el.currentTime);
  };

  const onChangeVolume = (val: number) => {
    const v = Math.min(1, Math.max(0, val));
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const onToggleSettings = () => setShowSettings((s) => !s);
  const onSelectRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSettings(false);
  };

  const renderVolumeIcon = () => {
    if (volume <= 0.001) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        />
        <motion.div
          className="relative w-[92%] md:w-[960px] bg-transparent rounded hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* 固定画布高度；背景改为纯白，无透明层/模糊层 */}
          <div className="relative h-[60vh] bg-white overflow-hidden">
            {/* 关闭按钮：画布内右上角 */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-text-secondary shadow transition-transform duration-150 hover:scale-105 active:scale-95 z-40"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
            {/* 纯白边框容器，去除磨砂与透明度 */}
            <div className="relative z-10 h-full w-full overflow-hidden">
              <video
                ref={videoRef}
                src={
                  videoUrl
                    ? `/api/apps/proxy-video?url=${encodeURIComponent(videoUrl)}`
                    : ""
                }
                className="w-full h-full object-cover bg-transparent"
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
                autoPlay
              />
            </div>
            {/* 播放时点击任意处可暂停 */}
            {isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 z-20"
                aria-label="暂停"
                title="暂停"
              />
            )}
            {/* 暂停时显示呼吸播放按钮，点击任意处播放 */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-20"
                aria-label="播放"
                title="播放"
              >
                <span className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-primary/80 text-white shadow animate-[breathColor_1600ms_ease-in-out_infinite]">
                  <Play size={18} />
                </span>
              </button>
            )}
          </div>
          {/* 进度条（占满一行） */}
          <div className="bg-white dark:bg-gray-900">
            <div className="px-3 pt-3">
              <div
                className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                onClick={onSeekByClick}
              >
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min(100, duration ? (currentTime / duration) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
            {/* 控制区：左侧 上一首/播放/下一首/时间；右侧 设置/音量 */}
            <div className="px-3 pb-3 mt-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="ml-1 text-[11px] text-text-muted select-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {/* 右侧组（音量条在左，settings与音量icon在右）。通过peer + order实现仅在hover音量icon时展开 */}
                <div
                  className="relative flex items-center gap-2"
                  onMouseEnter={() => setVolOpen(true)}
                  onMouseLeave={() => setVolOpen(false)}
                >
                  {/* 音量icon */}
                  <button
                    className="order-2 h-9 w-9 flex items-center justify-center rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                    title="音量"
                  >
                    {renderVolumeIcon()}
                  </button>
                  {/* 横向音量条：更短更细，移除旋钮；在 group hover 或自身 hover/focus 时保持展开，不跟随鼠标立即消失 */}
                  <div
                    className={`order-1 overflow-hidden transition-all duration-300 ease-out relative ${volOpen ? "w-28 opacity-100" : "w-0 opacity-0"}`}
                  >
                    {/* hover 提示手型icon */}
                    <span
                      className={`pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[var(--secondary)] transition-opacity duration-200 ${volOpen ? "opacity-100" : "opacity-0"}`}
                    >
                      <Hand size={12} />
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      className="vol-range w-28 appearance-none transition-none cursor-pointer"
                      onChange={(e) => onChangeVolume(Number(e.target.value))}
                      onFocus={() => setVolOpen(true)}
                      onBlur={() => setVolOpen(false)}
                      style={{
                        background:
                          "linear-gradient(to right, var(--primary, #ef4444) " +
                          Math.round(volume * 100) +
                          "%, rgba(107,114,128,0.35) " +
                          Math.round(volume * 100) +
                          "%)",
                        height: "4px",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                  {/* 设置icon（保持在最右侧） */}
                  <div className="relative order-3">
                    <button
                      onClick={onToggleSettings}
                      className="h-9 w-9 flex items-center justify-center rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                      title="设置"
                    >
                      <Settings size={16} />
                    </button>
                    {showSettings && (
                      <div className="absolute right-0 bottom-10 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 p-1">
                        {[1, 1.25, 1.5, 2].map((r) => (
                          <button
                            key={r}
                            onClick={() => onSelectRate(r)}
                            className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${playbackRate === r ? "text-primary" : "text-text-secondary"}`}
                          >
                            {r}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default VideoModal;

// 添加与AIGC模块一致的CSS样式
const styles = `
  @keyframes breathColor {
    0%, 100% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.18) saturate(1.08); }
  }
  /* 隐藏音量滑块的拇指，细线条显示 */
  .vol-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
    background: transparent;
    box-shadow: none;
    border: none;
  }
  .vol-range::-moz-range-thumb {
    width: 0;
    height: 0;
    background: transparent;
    border: none;
  }
`;
