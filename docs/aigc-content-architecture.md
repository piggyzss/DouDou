# AIGC 内容架构设计

## 🎯 整体架构

```
AIGC 内容组织架构
┌─────────────────────────────────────────────────────┐
│                    AIGC 内容                         │
├─────────────────┬───────────────┬───────────────────┤
│   图片内容      │   音乐内容    │    视频内容       │
│  (集合模式)     │  (独立模式)   │   (独立模式)      │
└─────────────────┴───────────────┴───────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ artwork_        │  │ music_tracks    │  │ videos          │
│ collections     │  │                 │  │                 │
│ ├─ id          │  │ ├─ id           │  │ ├─ id           │
│ ├─ title       │  │ ├─ title        │  │ ├─ title        │
│ ├─ description │  │ ├─ tags         │  │ ├─ tags         │
│ ├─ tags        │  │ ├─ audio_url    │  │ ├─ video_url    │
│ ├─ likes_count │  │ ├─ cover_url    │  │ ├─ cover_url    │
│ ├─ cover_image │  │ ├─ duration     │  │ ├─ duration     │
│ └─ ...         │  │ ├─ likes_count  │  │ ├─ likes_count  │
└─────┬───────────┘  │ └─ status      │  │ └─ status       │
      │              └─────────────────┘  └─────────────────┘
      │
      ▼ 1:N 关系
┌─────────────────┐
│ artwork_images  │
│ ├─ id          │
│ ├─ collection_id│ ◄── 外键关联
│ ├─ filename    │
│ ├─ file_url    │
│ ├─ thumbnail   │
│ ├─ file_size   │
│ ├─ width       │
│ ├─ height      │
│ └─ sort_order  │
└─────────────────┘
```

## 📋 设计模式对比

### 🎨 图片：集合模式 (Collection Pattern)

**为什么使用集合模式？**

1. **批量生成特性**：
   - AIGC 图片通常一次生成多张（如4张变体）
   - 需要作为一个主题或概念的集合展示
   - 用户通常关注的是"这个创意主题"而不是单张图片

2. **展示逻辑**：
   ```typescript
   // 展示一个作品集（包含多张图片）
   const collection = await ArtworkModel.getById(123);
   const images = await ArtworkModel.getImages(123);
   
   // UI: 显示集合标题 + 图片网格
   <ArtworkCollection title={collection.title}>
     <ImageGrid images={images} />
   </ArtworkCollection>
   ```

3. **存储优势**：
   - 减少重复信息（标题、描述、标签共享）
   - 便于批量管理和操作
   - 支持封面图片选择

### 🎵 音乐：独立模式 (Independent Pattern)

**为什么使用独立模式？**

1. **单一实体特性**：
   - 每首音乐都是独立的作品
   - 有独特的标题、时长、封面
   - 不需要分组展示

2. **播放逻辑**：
   ```typescript
   // 直接播放单个音乐
   const track = await MusicModel.getById(456);
   
   // UI: 音乐播放器
   <MusicPlayer 
     title={track.title}
     audioUrl={track.audio_url}
     coverUrl={track.cover_url}
   />
   ```

### 🎬 视频：独立模式 (Independent Pattern)

**为什么使用独立模式？**

1. **完整内容特性**：
   - 每个视频都是完整的内容单元
   - 有独立的播放时长和封面
   - 通常单独观看和分享

2. **播放逻辑**：
   ```typescript
   // 直接播放单个视频
   const video = await VideoModel.getById(789);
   
   // UI: 视频播放器
   <VideoPlayer 
     title={video.title}
     videoUrl={video.video_url}
     posterUrl={video.cover_url}
   />
   ```

## 🔍 实际应用场景

### 场景1: 图片展示页面
```typescript
// /aigc/artwork/123
const collection = await ArtworkModel.getById(123);
const images = await ArtworkModel.getImages(123);

// 展示：
// 标题: "赛博朋克城市夜景"
// 描述: "未来主义风格的城市景观..."
// 图片网格: [image1.jpg, image2.jpg, image3.jpg, image4.jpg]
```

### 场景2: 音乐列表页面
```typescript
// /aigc/music
const tracks = await MusicModel.getList();

// 展示：
// 1. "电子梦境" - 3:45
// 2. "星际旅行" - 4:12  
// 3. "机械心跳" - 2:58
```

### 场景3: 视频列表页面
```typescript
// /aigc/videos  
const videos = await VideoModel.getList();

// 展示：
// 1. "AI生成动画短片" - 1:30
// 2. "抽象艺术视频" - 2:15
// 3. "粒子特效展示" - 1:45
```

## 📊 数据量对比

### 图片内容
```
artwork_collections: 100 条记录
artwork_images: 400 条记录 (平均每个集合4张图)
存储效率: 高（共享元数据）
```

### 音乐内容  
```
music_tracks: 50 条记录
存储效率: 中（每条记录独立）
```

### 视频内容
```
videos: 30 条记录  
存储效率: 中（每条记录独立）
```

## 🎯 设计优势

### 图片集合模式优势
- ✅ **减少冗余**：多张相关图片共享标题、描述、标签
- ✅ **批量操作**：一次性点赞、分享整个作品集
- ✅ **逻辑清晰**：符合AIGC图片批量生成的特性
- ✅ **SEO友好**：一个URL对应一个完整的创作主题

### 音乐/视频独立模式优势
- ✅ **结构简单**：每个实体独立，易于理解和维护
- ✅ **查询高效**：无需JOIN操作，直接查询
- ✅ **扩展灵活**：每个内容类型可以独立演化
- ✅ **符合直觉**：音乐和视频天然就是独立的内容单元

## 🚀 扩展性考虑

### 如果需要统一管理
可以考虑引入内容类型抽象：

```sql
-- 内容统一表（可选的未来扩展）
CREATE TABLE content_items (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(20), -- 'artwork_collection', 'music_track', 'video'
  content_id INTEGER,       -- 指向具体表的ID
  title VARCHAR(255),
  created_at TIMESTAMP,
  likes_count INTEGER
);
```

但目前的分离设计更适合当前需求和使用场景。

## 📝 总结

当前设计是**混合架构**：
- **图片**：集合模式（1个集合 : N张图片）
- **音乐**：独立模式（1个实体 : 1首音乐）  
- **视频**：独立模式（1个实体 : 1个视频）

这种设计充分考虑了不同内容类型的特性和使用场景，是非常合理的架构选择！
