"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  // Plus,
  Palette,
  Film,
  Music4,
  // Heart,
  // MessageCircle,
  // X,
  // ChevronLeft,
  // ChevronRight,
  // Play,
  // SkipBack,
  // SkipForward,
  // Headphones,
  // Trash2,
  // Upload,
  ImagePlus,
} from "lucide-react";
// import LikeToggle from "../components/LikeToggle";
import ConfirmModal from "./components/ConfirmModal";
import CreateArtworkModal from "./components/CreateArtworkModal";
import CreateMusicModal from "./components/CreateMusicModal";
import CreateVideoModal from "./components/CreateVideoModal";
import AddImageModal from "./components/AddImageModal";
import ImagePreview from "./components/ImagePreview";
import FloatingPlayerBar from "./components/FloatingPlayerBar";
import ImagesSection, { /* ArtworkImage, Artwork */ } from "./sections/ImagesSection";
import VideosSection, { VideoTrack } from "./sections/VideosSection";
import MusicSection, { MusicTrack } from "./sections/MusicSection";

// 统一的日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// interface CreateArtworkModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (
//     artwork: Omit<Artwork, "id" | "likes" | "comments" | "createdAt">,
//   ) => void;
// }

// interface CreateMusicModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (
//     music: Omit<
//       MusicTrack,
//       "id" | "likes" | "comments" | "createdAt" | "duration"
//     >,
//   ) => void;
// }

// interface CreateVideoModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (
//     video: Omit<
//       VideoTrack,
//       "id" | "likes" | "comments" | "createdAt" | "duration"
//     >,
//   ) => void;
// }

// interface AddImageModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (images: string[]) => void;
//   artworkTitle: string;
//   artworkTags: string[];
//   artworkId?: string;
// }

export default function AIGCPage() {
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "music">(
    "images",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [selectedArtworkForAdd, setSelectedArtworkForAdd] =
    useState<Artwork | null>(null);

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    artworkId: string;
    imageIndex: number;
  } | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);

  const tabs = [
    { id: "images", label: "图片", icon: Palette },
    { id: "videos", label: "视频", icon: Film },
    { id: "music", label: "音乐", icon: Music4 },
  ] as const;

  // 加载作品集数据
  const loadArtworks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/aigc/artworks");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.collections) {
          // 转换数据格式以匹配前端接口
          const convertedArtworks: Artwork[] = data.data.collections.map(
            (collection: any) => ({
              id: collection.id.toString(),
              title: collection.title,
              tags: collection.tags || [],
              images: collection.images || [], // 这里images是ArtworkImage[]格式
              likes: collection.likes_count || 0,
              comments: 0, // 暂时设为0，后续可以添加评论功能
              createdAt: collection.created_at.split("T")[0],
            }),
          );

          // 为所有图片生成代理URL
          const artworksWithProxyUrls = convertedArtworks.map((artwork) => {
            if (artwork.images.length > 0) {
              const proxyImages = artwork.images.map((image) => {
                // 将COS URL转换为代理URL，同时保留图片的其他信息
                return {
                  ...image,
                  file_url: `/api/aigc/proxy-image?url=${encodeURIComponent(image.file_url)}`,
                };
              });
              return { ...artwork, images: proxyImages };
            }
            return artwork;
          });

          setArtworks(artworksWithProxyUrls);
        }
      }
    } catch (error) {
      // 静默处理错误，避免在生产环境中输出调试信息
    } finally {
      setLoading(false);
    }
  };

  // 加载视频列表（占位实现，等待后端 /api/aigc/videos 接口）
  const loadVideos = async () => {
    try {
      const res = await fetch("/api/aigc/videos");
      if (!res.ok) {
        setVideoTracks([]);
        return;
      }
      const data = await res.json().catch(() => ({}) as any);
      const list = (data?.data?.videos || data?.videos || []) as any[];
      if (!Array.isArray(list)) {
        setVideoTracks([]);
        return;
      }
      const videos: VideoTrack[] = list.map((v: any) => ({
        id: String(v.id),
        title: v.title,
        tags: v.tags || [],
        videoUrl: v.video_url
          ? `/api/aigc/proxy-audio?url=${encodeURIComponent(v.video_url)}`
          : "",
        coverUrl: v.cover_url
          ? `/api/aigc/proxy-image?url=${encodeURIComponent(v.cover_url)}`
          : "",
        duration: v.duration || 0,
        likes: v.likes_count || 0,
        comments: 0,
        createdAt: (v.created_at || "").split("T")[0] || "",
      }));
      setVideoTracks(videos);
    } catch (e) {
      // 静默处理错误
      setVideoTracks([]);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadArtworks();
    loadMusic();
    loadVideos();
  }, []);

  const handleCreateArtwork = (
    artworkData: Omit<Artwork, "id" | "likes" | "comments" | "createdAt">,
  ) => {
    // 创建成功后重新加载数据
    loadArtworks();

    // 显示成功消息
    // 作品集创建成功
  };

  // 加载音乐列表
  const loadMusic = async () => {
    try {
      const res = await fetch("/api/aigc/music");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.data?.tracks) return;
      const tracks: MusicTrack[] = data.data.tracks.map((t: any) => ({
        id: String(t.id),
        title: t.title,
        tags: t.tags || [],
        audioUrl: `/api/aigc/proxy-audio?url=${encodeURIComponent(t.audio_url)}`,
        coverUrl: t.cover_url
          ? `/api/aigc/proxy-image?url=${encodeURIComponent(t.cover_url)}`
          : "",
        duration: t.duration || 0,
        likes: t.likes_count || 0,
        comments: 0,
        createdAt: (t.created_at || "").split("T")[0] || "",
      }));
      setMusicTracks(tracks);
    } catch (e) {
      // 静默处理错误
    }
  };

  const handleCreateMusic = (
    _musicData: Omit<
      MusicTrack,
      "id" | "likes" | "comments" | "createdAt" | "duration"
    >,
  ) => {
    // 后端已落库并上传COS，直接重新拉取列表
    loadMusic();
  };

  // 删除单张图片
  const handleDeleteImage = async (collectionId: string, imageId: number) => {
    try {
      const response = await fetch(
        `/api/aigc/artworks/${collectionId}/images/${imageId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // 从本地状态中移除图片
        setArtworks((prev) =>
          prev.map((artwork) =>
            artwork.id === collectionId
              ? {
                  ...artwork,
                  images: artwork.images.filter((img) => img.id !== imageId),
                }
              : artwork,
          ),
        );
        
      } else {
        const errorData = await response.json();
        
      }
    } catch (error) {
      
    }
  };

  // 删除整个作品集
  const handleDeleteArtwork = async (artworkId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "删除作品集",
      message:
        "确定要删除这个作品集吗？这将删除所有相关的图片，此操作无法撤销。",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/aigc/artworks/${artworkId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            // 从本地状态中移除作品集
            setArtworks((prev) =>
              prev.filter((artwork) => artwork.id !== artworkId),
            );
            
          } else {
            const errorData = await response.json();
            
          }
        } catch (error) {
          
        }
      },
      type: "danger",
    });
  };

  const handleUpdateArtworkLikes = (_artworkId: string, _newCount: number) => {
    // 与博客一致：交由 LikeToggle 自行管理显示，父层不再二次写状态，避免跳变
  };

  const handleDeleteMusic = async (id: string) => {
    try {
      const res = await fetch(`/api/aigc/music/${id}`, { method: "DELETE" });
      if (!res.ok) {
        
        return;
      }
      setMusicTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      
    }
  };

  const handleCreateVideo = async () => {
    await loadVideos();
  };
  const handleDeleteVideo = async (videoId: string) => {
    await fetch(`/api/aigc/videos/${videoId}`, { method: "DELETE" }).catch(
      () => {},
    );
    await loadVideos();
  };
  const handleUpdateVideoLikes = (id: string, count: number) => {
    // 与博客一致：组件内部管理显示，但为了避免父层渲染造成数字回退，这里只更新本地数据源，保持与 LikeToggle 一致
    setVideoTracks((prev) =>
      prev.map((v) => (v.id === id ? { ...v, likes: count } : v)),
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;

    const artwork = artworks.find((a) => a.id === selectedImage.artworkId);
    if (!artwork) return;

    let newIndex = selectedImage.imageIndex;
    if (direction === "prev") {
      newIndex = newIndex > 0 ? newIndex - 1 : artwork.images.length - 1;
    } else {
      newIndex = newIndex < artwork.images.length - 1 ? newIndex + 1 : 0;
    }

    setSelectedImage({
      url: artwork.images[newIndex].file_url,
      artworkId: selectedImage.artworkId,
      imageIndex: newIndex,
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedImage) return;

    if (e.key === "ArrowLeft") {
      navigateImage("prev");
    } else if (e.key === "ArrowRight") {
      navigateImage("next");
    } else if (e.key === "Escape") {
      setSelectedImage(null);
    }
  };

  // 添加键盘事件监听
  useEffect(() => {
    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedImage, handleKeyDown]);

  const handleAddImages = async (artworkId: string, newImages: string[]) => {
    try {
      // 调用API添加图片到数据库
      const response = await fetch(`/api/aigc/artworks/${artworkId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: newImages }),
      });

      if (response.ok) {
        const result = await response.json();
        

        // 重新加载作品集数据以获取最新的图片信息
        await loadArtworks();
      } else {
        const errorData = await response.json();
        
      }
    } catch (error) {
      
    }
  };

  // 音乐播放（最小可用实现）
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [repeatMode, setRepeatMode] = useState<"one" | "all" | "shuffle">(
    "all",
  );
  const [showVolumePanel, setShowVolumePanel] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    const onPlay = () => setIsAudioPlaying(true);
    const onPause = () => setIsAudioPlaying(false);
    const onLoadedMeta = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [volume]);

  const togglePlayTrack = (track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrackId !== track.id) {
      audio.src = track.audioUrl;
      setCurrentTrackId(track.id);
      audio.play().catch(() => {});
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const findCurrentIndex = () =>
    musicTracks.findIndex((t) => t.id === currentTrackId);
  const handlePrev = () => {
    const idx = findCurrentIndex();
    if (idx <= 0) return;
    togglePlayTrack(musicTracks[idx - 1]);
  };
  const handleNext = () => {
    const idx = findCurrentIndex();
    if (idx < 0 || idx >= musicTracks.length - 1) return;
    togglePlayTrack(musicTracks[idx + 1]);
  };

  const handleSeekByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) =>
      prev === "all" ? "one" : prev === "one" ? "shuffle" : "all",
    );
  };

  const onChangeVolume = (v: number) => {
    const audio = audioRef.current;
    const vol = Math.min(Math.max(v, 0), 1);
    setVolume(vol);
    if (audio) audio.volume = vol;
  };

  // 兼容模块事件：让 MusicSection 触发的播放事件驱动页面级播放器
  useEffect(() => {
    const onPlayEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; url: string }>).detail;
      if (!detail || !detail.id) return;
      const t = musicTracks.find((x) => x.id === detail.id);
      if (t) togglePlayTrack(t);
    };
    window.addEventListener("music:play", onPlayEvent as EventListener);
    return () =>
      window.removeEventListener("music:play", onPlayEvent as EventListener);
  }, [musicTracks, currentTrackId, togglePlayTrack]);

  return (
    <div className="aigc-root min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">
            AIGC作品
          </h1>
          <p className="text-text-secondary mt-1 font-blog">
            AI生成的创意作品画廊
          </p>
        </div>

        {/* Tab导航 */}
        <div className="flex justify-start mb-8">
          <div className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="relative group">
                  <motion.button
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-text-secondary hover:text-text-primary"
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={20} />
                  </motion.button>
                  {/* 自定义tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {tab.label}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 新建按钮 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6">
            {activeTab === "images" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                <ImagePlus size={16} className="mr-2" />
                新建作品集
              </button>
            )}
            {activeTab === "music" && (
              <button
                onClick={() => setIsMusicModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                <Music4 size={16} className="mr-2" />
                新建音乐
              </button>
            )}
            {activeTab === "videos" && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                <Film size={16} className="mr-2" />
                新建视频
              </button>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === "images" && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <ImagesSection
                artworks={artworks}
                loading={loading}
                onAddImages={(artwork) => {
                  setSelectedArtworkForAdd(artwork);
                  setIsAddImageModalOpen(true);
                }}
                onDeleteArtwork={handleDeleteArtwork}
                onClickImage={(artworkId, index, url) =>
                  setSelectedImage({ url, artworkId, imageIndex: index })
                }
                onDeleteImage={handleDeleteImage}
                onUpdateArtworkLikes={handleUpdateArtworkLikes}
                formatDate={formatDate}
                formatNumber={formatNumber}
                isDev={process.env.NODE_ENV === "development"}
              />
            </motion.div>
          )}

          {activeTab === "videos" && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VideosSection
                videos={videoTracks}
                formatDate={formatDate}
                formatNumber={formatNumber}
                onDeleteVideo={handleDeleteVideo}
                onUpdateVideoLikes={handleUpdateVideoLikes}
                isDev={process.env.NODE_ENV === "development"}
              />
            </motion.div>
          )}

          {activeTab === "music" && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MusicSection
                tracks={musicTracks}
                currentTrackId={currentTrackId}
                setCurrentTrackId={setCurrentTrackId}
                isAudioPlaying={isAudioPlaying}
                formatDuration={formatDuration}
                formatNumber={formatNumber}
                formatDate={formatDate}
                onDeleteMusic={handleDeleteMusic}
                onUpdateMusicLikes={(id, count) =>
                  setMusicTracks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, likes: count } : t)),
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部悬浮播放器（完整版） */}
      <AnimatePresence mode="wait" initial={false}>
        {currentTrackId &&
          (() => {
            const track = musicTracks.find((t) => t.id === currentTrackId);
            if (!track) return null;
            return (
              <motion.div
                className="fixed inset-x-0 bottom-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <FloatingPlayerBar
                  title={track.title}
                  tags={track.tags}
                  coverUrl={track.coverUrl}
                  likes={track.likes}
                  isPlaying={isAudioPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  repeatMode={repeatMode}
                  volume={volume}
                  showVolumePanel={showVolumePanel}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  onTogglePlay={() => togglePlayTrack(track)}
                  onCycleRepeat={cycleRepeat}
                  onSeekByClick={handleSeekByClick}
                  onToggleVolumePanel={() => setShowVolumePanel((v) => !v)}
                  onChangeVolume={onChangeVolume}
                  onClose={() => {
                    const audio = audioRef.current;
                    if (audio) audio.pause();
                    setCurrentTrackId(null);
                  }}
                />
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* 新建作品集弹窗 */}
      <CreateArtworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateArtwork}
      />

      {/* 新建音乐弹窗 */}
      <CreateMusicModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSubmit={handleCreateMusic}
      />

      {/* 新建视频弹窗 */}
      <CreateVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSubmit={handleCreateVideo}
      />

      {/* 添加图片弹窗 */}
      <AddImageModal
        isOpen={isAddImageModalOpen}
        onClose={() => {
          setIsAddImageModalOpen(false);
          setSelectedArtworkForAdd(null);
        }}
        onSubmit={(newImages: string[]) => {
          if (selectedArtworkForAdd) {
            handleAddImages(selectedArtworkForAdd.id, newImages);
          }
        }}
        artworkTitle={selectedArtworkForAdd?.title || ""}
        artworkTags={selectedArtworkForAdd?.tags || []}
        artworkId={selectedArtworkForAdd?.id || ""}
      />

      <ImagePreview
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || ""}
        hasPrev={
          !!(
            selectedImage &&
            artworks.find((a) => a.id === selectedImage.artworkId)?.images
              .length &&
            artworks.find((a) => a.id === selectedImage.artworkId)!.images
              .length > 1
          )
        }
        hasNext={
          !!(
            selectedImage &&
            artworks.find((a) => a.id === selectedImage.artworkId)?.images
              .length &&
            artworks.find((a) => a.id === selectedImage.artworkId)!.images
              .length > 1
          )
        }
        onClose={() => setSelectedImage(null)}
        onPrev={() => navigateImage("prev")}
        onNext={() => navigateImage("next")}
        currentIndex={selectedImage?.imageIndex}
        total={
          artworks.find((a) => a.id === selectedImage?.artworkId)?.images
            .length || 0
        }
      />

      {/* 确认弹窗 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      {/* 隐藏音频元素用于播放 */}
      <audio ref={audioRef} preload="auto" playsInline className="hidden" />
    </div>
  );
}
