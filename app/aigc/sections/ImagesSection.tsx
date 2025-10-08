"use client";
import { Palette, Heart, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import LikeToggle from "../../components/LikeToggle";

export interface ArtworkImage {
  id: number;
  file_url: string;
  original_name: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  created_at: string;
}

export interface Artwork {
  id: string;
  title: string;
  tags: string[];
  images: ArtworkImage[];
  likes: number;
  comments: number;
  createdAt: string;
}

interface ImagesSectionProps {
  artworks: Artwork[];
  loading: boolean;
  onAddImages: (artwork: Artwork) => void;
  onDeleteArtwork: (artworkId: string) => void;
  onClickImage: (artworkId: string, index: number, url: string) => void;
  onDeleteImage: (collectionId: string, imageId: number) => void;
  onUpdateArtworkLikes: (artworkId: string, newCount: number) => void;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
  isDev?: boolean;
}

export default function ImagesSection({
  artworks,
  loading,
  onAddImages,
  onDeleteArtwork,
  onClickImage,
  onDeleteImage,
  onUpdateArtworkLikes,
  formatDate,
  formatNumber,
  isDev = false,
}: ImagesSectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-secondary">Loading...</span>
      </div>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <Palette className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-text-secondary">暂无作品集</p>
        {isDev && (
          <p className="text-sm text-text-muted mt-2 blog-body-text">
            点击上方按钮创建您的第一个作品集
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="relative group">
          {/* 作品集信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-text-primary font-heading">
                {artwork.title}
              </h3>
              {process.env.NODE_ENV === "development" && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => onAddImages(artwork)}
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="添加图片"
                  >
                    <ImagePlus size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteArtwork(artwork.id)}
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="删除作品集"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {artwork.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <div className="flex items-center gap-1">
                <time>{formatDate(artwork.createdAt)}</time>
                <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">
                  ·
                </span>
                <span>{artwork.images.length} 张图片</span>
              </div>
              <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">
                ·
              </span>
              <div className="flex items-center gap-1">
                <LikeToggle
                  targetType="artwork"
                  targetId={parseInt(artwork.id, 10)}
                  initialCount={artwork.likes}
                  size={14}
                  showCount={true}
                  className="text-[11px]"
                  countClassName="text-[11px] leading-none text-text-muted"
                  unlikedColorClass="text-text-muted"
                  likedColorClass="text-red-500"
                />
              </div>
            </div>
          </div>

          {/* 作品展示区域 */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
              {artwork.images.map((image, index) => (
                <div key={index} className="relative group/image flex-shrink-0">
                  <div
                    className="w-80 h-60 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden cursor-pointer"
                    onClick={() =>
                      onClickImage(artwork.id, index, image.file_url)
                    }
                  >
                    {/* 覆盖层与视频卡片一致的淡入（仅当前图片触发） */}
                    <div className="absolute inset-0 opacity-0 group-hover/image:opacity-100 transition-opacity duration-100 bg-black/10" />
                    <Image
                      src={image.file_url}
                      alt={image.original_name || "作品图片"}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transform transition-transform duration-150 ease-out will-change-transform group-hover/image:scale-[1.03] group-hover/image:brightness-[1.03] group-hover/image:animate-[breatheScale_800ms_ease-in-out_infinite]"
                    />
                  </div>
                  {process.env.NODE_ENV === "development" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(artwork.id, image.id);
                      }}
                      className="absolute bottom-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity"
                      title="删除图片"
                    >
                      <Trash2 size={16} className="text-gray-700" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 作品集分隔线 */}
          <div className="mt-3 mb-4 border-b border-gray-200 dark:border-gray-700"></div>
        </div>
      ))}
    </div>
  );
}
