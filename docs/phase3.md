# Phase 3: 核心浏览页面 (Core Pages)

> 状态: ✅ COMPLETED
> 完成时间: 2026-04-22
> 前置依赖: Phase 1 ✅, Phase 2 ✅
> 目标: 实现发行物列表/详情、艺人目录/详情、全局搜索

---

## 任务清单

### 1. 发行物列表页 (/releases)
- [x] `app/releases/page.tsx` — 服务端组件，加载 releases
- [x] `app/releases/ReleaseList.tsx` — 客户端交互组件
  - 搜索框: 实时过滤标题
  - 类型筛选: 全部 / SINGLE / ALBUM / COMPILATION
  - 排序: 最新发行 / 最早发行 / 名称排序
  - 视图切换: Grid / List / Compact Table
  - 企划高亮色动态适配

### 2. 发行物详情页 (/release/[id])
- [x] `app/release/[id]/page.tsx` — ISR (revalidate: 86400)
  - Hero: 大封面 + 企划标签 + 标题
  - 元数据网格: 发行日 / 厂牌 / Catalog / 格式 / 曲数
  - Tracklist: 序号 + 曲目名 + 艺人 + BPM + 时长
  - Apple Music 外链按钮
  - 同企划推荐 (4 张相关专辑)

### 3. 艺人目录页 (/artists)
- [x] `app/artists/page.tsx` — ISR
  - 角色筛选栏: 偶像 / 组合 / 声优 / 创作者
  - 空状态提示（数据待导入）
  - 卡片网格布局（头像 + 名称 + 角色 + 企划色点）

### 4. 艺人详情页 (/artist/[id])
- [x] `app/artist/[id]/page.tsx` — ISR
  - Hero: 头像 + 名称 + 角色标签 + 企划标签
  - 统计: 曲目数 / 专辑数
  - 作品列表区（数据待填充）

### 5. 全局搜索页 (/search)
- [x] `app/search/page.tsx` — 服务端加载数据
- [x] `app/search/SearchClient.tsx` — 客户端搜索交互
  - 大搜索框 (autoFocus)
  - 分类 Tab: 全部 / 曲目 / 专辑
  - 实时过滤 (titleJa / titleRomaji / titleZh / artist)
  - 空状态 + 无结果状态

### 6. 探索页 (/explore)
- [x] `app/explore/page.tsx` — ISR
  - 曲风地图 (开发中)
  - 发行时间线 (开发中)
  - 系列对比 (开发中)
  - 我的收藏 (可用)
  - 提示: 可视化功能依赖 audio-features 数据

### 7. 收藏页 (/favorites)
- [x] `app/favorites/page.tsx` — 客户端组件
  - localStorage 持久化
  - 列表展示: 封面 + 标题 + 副标题
  - 悬停删除按钮
  - 空状态提示

---

## 路由总览

| 路由 | 类型 | 功能 |
|---|---|---|
| `/` | Static | 首页（数据概览 + 最新发行 + 可试听 + 企划卡片） |
| `/releases` | Static | 发行物列表（筛选/排序/视图切换） |
| `/releases?series=765` | Static | 按企划筛选发行物 |
| `/release/[id]` | Dynamic | 发行物详情（封面/Tracklist/推荐） |
| `/artists` | Static | 艺人目录（角色筛选） |
| `/artist/[id]` | Dynamic | 艺人详情 |
| `/search` | Static | 全局搜索（曲目+专辑） |
| `/explore` | Static | 探索入口（可视化功能收拢） |
| `/favorites` | Client | 收藏管理 |

---

## 技术细节

- **Next.js 15 App Router**: `params` 和 `searchParams` 均为 Promise（异步解构）
- **ISR**: 列表页 / 探索页 / 首页 设置 `revalidate: 86400`
- **动态路由**: `/release/[id]` / `/artist/[id]` 服务端渲染
- **客户端组件**: 搜索交互、收藏管理、发行物列表交互
- **图片**: Next.js Image + iTunes CDN 600×600 封面

---

## 下一阶段入口

→ [docs/phase4.md](./phase4.md) （播放器实现 + 数据填充 +  polishing）
