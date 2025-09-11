# 点赞系统设计分析

## 🏗️ 当前架构

### 混合设计模式
```
业务表 (快速查询)          点赞记录表 (详细追踪)
┌─────────────────┐       ┌─────────────────────┐
│ artwork_collections │    │      likes          │
│ ├─ id            │    │ ├─ target_type      │
│ ├─ title         │◄──┤ ├─ target_id        │
│ ├─ likes_count   │    │ ├─ anon_id          │
│ └─ ...           │    │ ├─ ip_hash          │
└─────────────────┘    │ ├─ ua_hash          │
                       │ ├─ status           │
┌─────────────────┐    │ └─ created_at       │
│   blog_posts    │    └─────────────────────┘
│ ├─ id           │◄──┘
│ ├─ title        │
│ ├─ likes_count  │
│ └─ ...          │
└─────────────────┘
```

## 📊 设计方案对比

### 方案A: 仅在业务表中添加字段
```sql
-- 简单设计
ALTER TABLE blog_posts ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN liked_users TEXT[]; -- 存储用户ID数组
```

**优点：**
- ✅ 查询速度快
- ✅ 结构简单
- ✅ 减少JOIN操作

**缺点：**
- ❌ 无法防重复点赞（匿名用户）
- ❌ 难以扩展到新内容类型
- ❌ 无法追踪点赞历史
- ❌ 数组字段查询效率低
- ❌ 每个表都需要重复实现逻辑

### 方案B: 纯独立点赞表
```sql
-- 纯关系设计
CREATE TABLE likes (
  target_type VARCHAR(20),
  target_id INTEGER,
  user_identifier VARCHAR(128),
  created_at TIMESTAMP
);
```

**优点：**
- ✅ 统一的点赞逻辑
- ✅ 易于扩展
- ✅ 完整的历史记录
- ✅ 防重复机制完善

**缺点：**
- ❌ 每次查询都需要COUNT()
- ❌ 列表页性能差
- ❌ 缓存复杂度高

### 方案C: 混合设计（当前方案）
```sql
-- 业务表保留计数字段
likes_count INTEGER DEFAULT 0

-- 独立表记录详细信息
CREATE TABLE likes (
  target_type VARCHAR(20),
  target_id INTEGER,
  anon_id VARCHAR(64),
  ip_hash VARCHAR(128),
  ua_hash VARCHAR(128),
  status VARCHAR(10)
);
```

**优点：**
- ✅ 查询性能优异（读取计数）
- ✅ 功能完整（防重复、历史）
- ✅ 统一的点赞系统
- ✅ 数据一致性保证
- ✅ 易于维护和扩展

**缺点：**
- ⚠️ 需要维护数据一致性
- ⚠️ 存储空间稍大
- ⚠️ 实现复杂度中等

## 🎯 实际应用场景

### 1. 列表页查询（高频）
```sql
-- 混合设计：直接读取，性能最优
SELECT id, title, likes_count FROM blog_posts ORDER BY likes_count DESC;

-- 纯独立表：需要JOIN和COUNT，性能较差
SELECT b.id, b.title, COUNT(l.id) as likes_count 
FROM blog_posts b 
LEFT JOIN likes l ON l.target_type = 'blog' AND l.target_id = b.id 
WHERE l.status = 'liked'
GROUP BY b.id, b.title 
ORDER BY likes_count DESC;
```

### 2. 用户点赞检查（中频）
```sql
-- 独立表：统一逻辑
SELECT status FROM likes 
WHERE target_type = 'blog' AND target_id = 123 
AND (anon_id = 'xxx' OR (ip_hash = 'xxx' AND ua_hash = 'xxx'));
```

### 3. 点赞操作（低频但重要）
```typescript
// 混合设计：事务保证一致性
async function toggleLike(targetType, targetId, user) {
  await db.transaction(async (tx) => {
    // 1. 更新详细记录
    const result = await LikesModel.setLike(targetType, targetId, true, user);
    
    // 2. 更新计数缓存
    await updateLikesCount(targetType, targetId, result.likesCount);
  });
}
```

## 🚀 性能优化策略

### 1. 读写分离
- **读取**：主要从业务表的 `likes_count` 字段
- **写入**：同时更新点赞表和计数字段
- **一致性**：通过事务和定时同步保证

### 2. 缓存策略
```typescript
// 热点内容缓存
const likesCount = await redis.get(`likes:${targetType}:${targetId}`);
if (!likesCount) {
  // 从数据库读取并缓存
  const count = await getLikesCountFromDB(targetType, targetId);
  await redis.setex(`likes:${targetType}:${targetId}`, 3600, count);
}
```

### 3. 异步同步
```typescript
// 定时任务同步计数
async function syncLikesCount() {
  const results = await query(`
    SELECT target_type, target_id, COUNT(*) as actual_count
    FROM likes 
    WHERE status = 'liked'
    GROUP BY target_type, target_id
  `);
  
  // 批量更新业务表
  for (const row of results) {
    await updateBusinessTableCount(row.target_type, row.target_id, row.actual_count);
  }
}
```

## 📈 扩展性考虑

### 新增内容类型
```typescript
// 只需要在枚举中添加新类型
export type TargetType = 'blog' | 'artwork' | 'music' | 'video' | 'comment' | 'reply';

// 无需修改表结构，立即支持新类型
LikesModel.setLike('comment', commentId, true, user);
```

### 高级功能
```sql
-- 点赞排行榜
SELECT target_type, target_id, COUNT(*) as likes_count
FROM likes 
WHERE status = 'liked' AND created_at > NOW() - INTERVAL '7 days'
GROUP BY target_type, target_id
ORDER BY likes_count DESC
LIMIT 10;

-- 用户偏好分析
SELECT target_type, COUNT(*) as preference_count
FROM likes 
WHERE anon_id = 'user123' AND status = 'liked'
GROUP BY target_type;
```

## 🎯 结论

混合设计是当前最优解，因为它：

1. **平衡了性能和功能**：快速读取 + 完整功能
2. **适应了实际需求**：列表页高性能 + 防重复机制
3. **保证了可扩展性**：统一系统 + 灵活架构
4. **维护了数据一致性**：事务机制 + 定时同步

这种设计在大多数现代Web应用中都被广泛采用，如Reddit、Medium、知乎等平台。
