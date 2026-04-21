# 偶像大师音乐数据库 (ImasMusic)

> Next.js + TypeScript + Tailwind CSS 构建的 THE IDOLM@STER 系列音乐数据库。

---

## 1. 项目概述

这是一个面向 THE IDOLM@STER（偶像大师）全系列的音乐数据库 Web 应用，收录各子系列的歌曲、偶像、创作者信息，提供多维度检索、数据可视化和曲风探索功能。

- **当前数据覆盖**：765AS、Shiny Colors（其他系列已配置但无数据）
- **设计方向**：warm editorial（暖色编辑风格），参考 `docs/DESIGN-claude.md`

---

## 2. 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 3.4 |
| 图标 | Lucide React |
| 图表 | Recharts |
| 搜索 | Fuse.js (模糊搜索) |

### 关键配置
- `next.config.js` — 极简配置，`images.unoptimized: true`
- `tsconfig.json` — strict 模式，路径别名 `@/*` 映射到 `./*`
- `tailwind.config.js` — 大量自定义 design tokens（颜色、字体、间距、阴影）
- `postcss.config.js` — 标准 Tailwind + autoprefixer

---

## 3. 项目结构

```
ImasMusic/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页：系列卡片、曲风饼图、标签云
│   ├── layout.tsx                # 根布局：SiteNav + footer
│   ├── globals.css               # 全局样式 + Tailwind + Claude Design System
│   ├── series/[id]/              # 系列详情页：筛选表格
│   ├── song/[id]/                # 歌曲详情页：元数据、推荐
│   ├── genre/[slug]/             # 曲风详情页：描述、歌曲列表、系列分布饼图
│   ├── idol/[id]/                # 偶像详情页：曲风饼图、编曲人统计
│   ├── arranger/[id]/            # 编曲人详情页：曲风柱状图、系列分布
│   ├── search/                   # 搜索页：Fuse.js 模糊搜索 + 多维度筛选
│   ├── map/                      # 曲风地图：散点图（energy × valence）
│   ├── timeline/                 # 发行时间线：堆叠面积图
│   ├── compare/                  # 系列对比：雷达图
│   └── favorites/                # 收藏页：localStorage 持久化
│
├── components/                   # 共享组件
│   ├── SiteNav.tsx               # 全局粘性导航
│   ├── GenreDecorator.tsx        # 曲风页面 SVG 背景装饰
│   ├── GenrePageWrapper.tsx      # 曲风页面布局包裹器
│   ├── LoadingSkeleton.tsx       # 加载骨架屏
│   └── ErrorFallback.tsx         # 错误回退 UI
│
├── lib/                          # 工具层
│   ├── data.ts                   # 数据聚合 + 所有查询函数
│   └── hooks.ts                  # useLocalStorage（含 hydration 安全）
│
├── types/
│   └── song.ts                   # 核心 TypeScript 类型定义
│
├── data/                         # 静态歌曲数据（按系列分文件）
│   ├── 765/sample.ts             # 765AS 数据
│   └── shinycolors/sample.ts     # Shiny Colors 数据
│
├── styles/                       # 主题配置
│   ├── genres.config.ts          # 9 大曲风定义 + 配色
│   └── series.config.ts          # 5 系列定义 + 品牌色
│
├── docs/
│   └── DESIGN-claude.md          # 设计系统文档
│
└── plan.md                       # 实现计划（中文）
```

---

## 4. 数据模型

核心类型定义在 `types/song.ts`：

### Song（歌曲）
- 多语言标题：`titleJa`、`titleZh`、`titleRomaji`
- 系列归属：`series`（`765` | `cinderella` | `million` | `shinycolors` | `sidem`）
- 表演偶像：`idols: Idol[]`
- 创作者：`composer`、`lyricist`、`arranger`
- 曲风分类：`primaryGenre`（PrimaryGenre）+ `subGenres[]`
- 情感指标：`energy: 0-10`、`valence: 0-10`
- 发行历史：`releases[]`（album / year / type）
- 标签、翻唱标识、外部链接、跨系列引用

### PrimaryGenre（9 大曲风）
`idol-pop`、`mature-pop`、`rock-energy`、`electronic`、`jazz-soul`、`classical`、`wafuu`、`stage-drama`、`ambient-ballad`

### Series（5 系列）
`765`、`cinderella`、`million`、`shinycolors`、`sidem`

---

## 5. 页面路由

| 路由 | 功能 | 亮点 |
|---|---|---|
| `/` | 首页 | 系列卡片、曲风环形图、标签云、随机发现 |
| `/series/[id]` | 系列详情 | 6 维度筛选（专辑/年代/曲风/作曲/作词/编曲）、可排序曲目表格 |
| `/song/[id]` | 歌曲详情 | 元数据、翻唱信息、创作者、相似歌曲推荐 |
| `/genre/[slug]` | 曲风详情 | 描述、歌曲列表、系列分布饼图、Top 编曲人 |
| `/idol/[id]` | 偶像详情 | 曲风饼图、Top 编曲人、带系列徽章的歌曲列表 |
| `/arranger/[id]` | 编曲人详情 | 曲风偏好柱状图、系列分布、全部作品 |
| `/search` | 搜索 | Fuse.js 模糊搜索、多维度筛选、列表/网格切换、排序 |
| `/map` | 曲风地图 | 散点图 X=energy, Y=valence，支持系列/曲风筛选 |
| `/timeline` | 时间线 | 堆叠面积图展示每年各曲风发行量 |
| `/compare` | 系列对比 | 雷达图对比两系列曲风占比、独有曲风列表 |
| `/favorites` | 收藏 | localStorage 持久化、导出文本 |

---

## 6. 设计系统

项目使用 **Claude Design System**，定义在 `globals.css` 和 `tailwind.config.js` 中：

### 核心色板（暖色编辑风格）
| Token | 色值 | 用途 |
|---|---|---|
| `parchment` | `#f5f4ed` | 页面背景 |
| `ivory` | `#faf9f5` | 卡片/表层背景 |
| `terracotta` | `#c96442` | 品牌主色、强调 |
| `near-black` | `#141413` | 主文字 |
| `olive-gray` | `#5e5d59` | 次要文字 |
| `stone-gray` | `#87867f` | 辅助文字 |
| `border-cream` | `#f0eee6` | 卡片边框 |
| `border-warm` | `#e8e6dc` | 分割线 |

### 字体
- 标题：`Georgia, Cambria, serif`（weight 500）
- 正文：`system-ui, -apple-system, sans-serif`

### 暗色模式
通过 Tailwind `dark:` 类 + CSS 变量实现。

### 曲风主题
每个曲风页面通过 `GenreDecorator.tsx` 渲染独特的 SVG 几何背景图案，颜色来源于 `genres.config.ts`。

---

## 7. 关键文件速查

| 文件 | 职责 | 修改前必读 |
|---|---|---|
| `types/song.ts` | 核心数据模型 | 所有数据结构的来源 |
| `lib/data.ts` | 数据聚合 + 查询 API | 添加新系列数据后需在此注册 |
| `styles/series.config.ts` | 5 系列配置（品牌色、名称等） | 系列卡片、饼图、徽章颜色来源 |
| `styles/genres.config.ts` | 9 曲风配置（配色、字体、描述） | 曲风页面、标签、背景图案颜色来源 |
| `app/globals.css` | Design System tokens + 组件类 | 全局样式变更 |
| `components/SiteNav.tsx` | 全局导航 | 新增页面路由时需更新 |
| `components/GenreDecorator.tsx` | 曲风 SVG 背景装饰 | 曲风视觉风格 |
| `lib/hooks.ts` | `useLocalStorage` | 新增持久化状态时参考 |

---

## 8. 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev
# → http://localhost:3000

# 生产构建
npm run build
```

---

## 9. 当前状态与注意事项

- **数据完整度**：765AS 和 Shiny Colors 有示例数据；Cinderella、Million、SideM 已配置但无歌曲数据。
- **曲风颜色**：9 大曲风已统一为 warm editorial 低饱和暖色调（见 `styles/genres.config.ts`），与整体设计风格一致。
- **系列品牌色**：`series.config.ts` 中的系列色（765AS 橙、百万黄、闪耀色彩紫等）保持原品牌色，独立于曲风系统。
- **localStorage 前缀**：所有持久化键使用 `imas-db-` 前缀。
- **Client 组件**：大多数页面使用 `'use client'` 指令，配合 React state 管理筛选、排序和视图模式。
