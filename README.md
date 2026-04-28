# iM@S Archive — 偶像大师音乐数据库

> Next.js 15 + TypeScript + Tailwind CSS 构建的 THE IDOLM@STER 系列音乐数据库。暖色编辑风格（Warm Editorial），支持真实音频试听、多企划数据、移动端响应式。

**当前版本：v0.5.0**

**在线地址**：https://master.imas-music.pages.dev（Cloudflare Pages）

---

## 🚀 快速上手（写给恢复上下文的我）

```bash
# 1. 安装依赖（如未安装）
npm install

# 2. 开发模式
npm run dev
# → http://localhost:3000

# 3. 类型检查
npm run type-check

# 4. 生产构建
npm run build
# → 输出到 dist/（静态导出，5,193 页面）
```

**当前数据状态**：3,403 tracks + 734 releases + 1,039 artists（344 IDOL + 695 CREATOR，覆盖 765AS / Cinderella / Million Live / SideM / Shiny Colors / Gakuen）

---

## 🤖 AI 助手接手速查（必读）

> 下次打开此项目时，先读这一节恢复上下文。

### 项目当前状态
- **已部署**：https://master.imas-music.pages.dev（Cloudflare Pages）
- **自动部署**：`git push origin master` → GitHub Actions → Cloudflare Pages
- **构建模式**：Next.js **静态导出**（`output: 'export'`，非 SSR/ISR）

### 静态导出关键约束（违反会导致构建失败）
| 约束 | 正确做法 | 错误做法 |
|------|---------|---------|
| 动态路由 | 必须实现 `generateStaticParams` | 直接访问 `params` 不预生成 |
| URL 查询参数 | 客户端 `useSearchParams` + `Suspense` | 服务端 `await searchParams` |
| 图片 | `images.unoptimized: true` | 使用 Next.js Image 优化 |
| 数据 | 构建时从 JSON 加载 | 运行时 API 调用 |

### 需要修改动态路由时
如果新增 `[id]` 路由，必须在 `page.tsx` 中：
```tsx
import { getAllXxx } from '@/lib/data'

export async function generateStaticParams() {
  const items = await getAllXxx()
  return items.map((item) => ({ id: item.id }))
}
```

### 数据更新流程
1. 修改 `data/tracks.json` / `data/releases.json` / `data/artists.json`
2. `npm run build` 验证无报错
3. `git add . && git commit -m "..." && git push origin master`
4. GitHub Actions 自动部署（约 3 分钟）

### 当前活跃任务

📋 **详细路线图与待办**：见 [`docs/roadmap.md`](docs/roadmap.md)

> 活跃阶段：**Phase 8 — 远期规划与数据补全**（🚧 进行中）
> 已归档阶段：Phase 1~7 见 [`docs/`](docs/)

---

## 📋 项目阶段总览

| 阶段 | 状态 | 核心交付 | 文档 |
|---|---|---|---|
| **Phase 1** | ✅ | 设计系统、全局布局壳子、Zustand 状态、类型定义 | [docs/phase1.md](docs/phase1.md) |
| **Phase 2** | ✅ | iTunes API 封装、数据导入脚手架、统一数据层 | [docs/phase2.md](docs/phase2.md) |
| **Phase 3** | ✅ | 发行物/艺人/搜索/探索/收藏页面 | [docs/phase3.md](docs/phase3.md) |
| **Phase 4** | ✅ | 真实音频播放器、多企划数据导入、移动端适配 | [docs/phase4.md](docs/phase4.md) |
| **Phase 5** | ✅ | 单曲详情页、艺人筛选、播放修复、艺人数据导入 | [docs/phase5.md](docs/phase5.md) |
| **Phase 6** | ✅ | 数据层扩展、功能增强、交互优化 | [docs/phase6.md](docs/phase6.md) |
| **Phase 7** | ✅ | 移动端全屏播放器、Swipe 手势、全局列表移动端适配与交互闭环 | [docs/phase7.md](docs/phase7.md) |
| **Phase 8** | ✅ 已完成 | MusicBrainz Credits/Catalog/Label + Uta-Net 歌词 + 艺人头像/名字修复 | [docs/phase8-planning.md](docs/phase8-planning.md) |

---

## 🏗️ 架构决策（必读，防止失忆）

### 技术栈
| 层 | 技术 | 用途 |
|---|---|---|
| 框架 | Next.js 15 (App Router) | 静态导出（`output: 'export'`） |
| 语言 | TypeScript 5 (strict) | 类型安全 |
| 样式 | Tailwind CSS 3.4 | 原子化样式 |
| 图标 | Lucide React | 图标系统 |
| 状态 | Zustand + persist | 播放器状态持久化 |
| 主题 | next-themes | 亮色/暗色切换 |
| 图表 | Recharts | Energy × Valence 散点图、时间线 |
| 动画 | Framer Motion | 播放器展开/页面过渡 |
| 搜索 | 客户端过滤 | `useSearchParams` + `Suspense` |
| 测试 | Playwright | E2E 自动化测试（移动端+桌面端） |
| 部署 | Cloudflare Pages | GitHub Actions 自动部署 |

### 关键决策记录
1. **数据存储**：JSON 文件（`data/*.json`）→ 阶段二可迁移到数据库
2. **部署方式**：Cloudflare Pages 静态导出 → `next.config.js` 设置 `output: 'export'`, `distDir: 'dist'`, `images.unoptimized: true`
3. **图片源**：iTunes/Apple Music CDN（`is*-ssl.mzstatic.com`）→ 已配置 remotePatterns
4. **音频源**：iTunes 30秒试听（`previewUrl`）→ HTML5 Audio API
5. **Spotify API**：⏸️ 搁置中（待 Client ID/Secret）→ energy/valence/BPM 字段预留，当前用 BPM+调性估算 mock
6. **旧页面**：归档至 `app/_archive/`（`tsconfig.json` 已排除）
7. **暗色模式**：默认亮色，暗色 Tone-matching（非纯黑，深暖灰 `#1a1a18`）
8. **静态导出约束**：
   - 动态路由必须实现 `generateStaticParams`
   - 服务端组件不能使用 `await searchParams` → 需通过客户端 `useSearchParams` + `Suspense` 处理
   - 不支持 ISR/`revalidate`（构建时一次性生成所有页面）

---

## 📁 目录结构（当前实际状态）

```
ImasMusic/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局: Sidebar + TopAppBar + BottomPlayer + Footer
│   ├── page.tsx                  # 首页: 统计数据 + 最新发行 + 可试听 + 企划卡片
│   ├── globals.css               # Claude Design System + 暗色变量
│   ├── template.tsx              # 页面过渡动画模板
│   ├── releases/
│   │   ├── page.tsx              # 发行物列表页（服务端）
│   │   └── ReleaseList.tsx       # 客户端：Grid/List/Table 三视图 + 筛选排序
│   ├── release/[id]/
│   │   ├── page.tsx              # 发行物详情: Hero + Tracklist + Credits + 推荐
│   │   └── loading.tsx           # Skeleton 加载态
│   ├── tracks/
│   │   ├── page.tsx              # 单曲列表页（服务端）
│   │   ├── TrackListClient.tsx   # 客户端：卡片网格 + 筛选排序
│   │   └── loading.tsx           # Skeleton 加载态
│   ├── track/[id]/
│   │   ├── page.tsx              # 单曲详情: Hero + Credits + BPM/时长/调性 + 相似曲目
│   │   └── loading.tsx           # Skeleton 加载态
│   ├── artists/
│   │   └── page.tsx              # 艺人目录: 角色筛选 + 卡片网格
│   ├── artist/[id]/
│   │   ├── page.tsx              # 艺人详情: 头像 + 统计 + 作品列表
│   │   └── loading.tsx           # Skeleton 加载态
│   ├── series/[id]/
│   │   └── page.tsx              # 企划详情页
│   ├── search/
│   │   ├── page.tsx              # 搜索页（服务端加载数据）
│   │   └── SearchClient.tsx      # 客户端: 实时过滤 + 分类 Tab
│   ├── explore/
│   │   ├── page.tsx              # 探索入口: 曲风地图/时间线/对比收拢
│   │   └── map/
│   │       ├── page.tsx          # 曲风地图: Energy × Valence 散点图
│   │       └── GenreMapClient.tsx # Recharts ScatterChart 客户端
│   ├── favorites/
│   │   └── page.tsx              # 收藏页: localStorage 持久化
│   └── _archive/                 # 旧页面归档（不参与构建）
│       ├── series/, song/, genre/, idol/, arranger/
│       ├── map/, timeline/, compare/
│       └── search/               # 旧搜索实现
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # 侧边栏: 6企划 + 探索/全部/收藏 + 主题切换
│   │   ├── TopAppBar.tsx         # 顶栏: 主导航 + 搜索/关闭按钮
│   │   ├── BottomPlayer.tsx      # 底部播放器: MINI/EXPANDED/HIDDEN + 队列浮层 + Swipe 手势
│   │   ├── BottomNav.tsx         # 移动端底部导航栏（4 Tab）
│   │   └── ThemeProvider.tsx     # next-themes wrapper
│   ├── ui/
│   │   └── Skeleton.tsx          # 统一 Skeleton 组件
│   ├── MobileTracklist.tsx       # 移动端曲目列表（卡片式）
│   ├── FavoriteButton.tsx        # ♥ 收藏按钮（全局复用）
│   ├── TrackPlayButton.tsx       # ▶ 播放按钮（接入 playerStore）
│   ├── KeyboardShortcuts.tsx     # 全局键盘快捷键
│   ├── LoadingSkeleton.tsx       # 通用加载占位
│   ├── GenreDecorator.tsx        # 曲风装饰组件
│   ├── GenrePageWrapper.tsx      # 曲风页面包装器
│   ├── ErrorFallback.tsx         # 错误边界回退 UI
│   └── SiteNav.tsx               # 站点导航（SSR 安全）
│
├── lib/
│   ├── utils.ts                  # cn() 工具函数
│   ├── data.ts                   # 统一数据查询层（异步 + 缓存）
│   ├── series.ts                 # 6企划配置（品牌色/名称/图标）
│   ├── color.ts                  # Canvas 封面主色提取
│   ├── hooks.ts                  # useFavorites 等自定义 hooks
│   ├── api/
│   │   ├── itunes.ts             # iTunes Search API 封装
│   │   └── audio.ts              # 音频工具（验证/时长解析）
│   └── store/
│       └── playerStore.ts        # Zustand: 播放状态 + 队列 + 循环/随机
│
├── types/
│   └── index.ts                  # 核心类型: Track/Release/Artist/PlayerState
│
├── data/                         # 静态 JSON 数据
│   ├── tracks.json               # 曲目数据（3,403 条）
│   ├── releases.json             # 发行物数据（734 条）
│   ├── artists.json              # 艺人数据（1,039 条：344 IDOL + 695 CREATOR）
│   └── seed/                     # 数据导入脚手架
│       ├── input/                # 输入文件（每行一个查询词）
│       ├── output/               # 脚手架输出 + 流水线补丁
│       │   ├── mb_track_patches.json     # MusicBrainz Credits 补丁
│       │   ├── mb_release_patches.json   # MusicBrainz Catalog/Label 补丁
│       │   └── lyrics_patches.json       # Uta-Net 歌词补丁
│       └── wiki-dumps/           # Wiki 页面 dump（待录入）
│
├── scripts/
│   ├── seed-cli.ts               # CLI 数据导入工具（iTunes）
│   ├── batch-fetch-albums.ts     # 6 企划批量专辑抓取
│   ├── seed-idols.ts             # imasparql 艺人抓取
│   ├── merge-wiki-supplement.ts  # Wiki dump 合并到 tracks.json
│   ├── parse-wiki-dump.ts        # Wiki dump 文本解析器
│   └── pipeline/                 # Phase 8 自动化流水线模块
│       ├── musicbrainz.ts              # MusicBrainz API 客户端（1 req/sec 限流 + 重试）
│       ├── mb-release-batch.ts         # Release Catalog/Label/Barcode 批量抓取
│       ├── mb-track-batch.ts           # Recording Credits（作词/作曲/编曲）批量抓取
│       ├── apply-mb-patches.ts         # 多源合并引擎（自动创建 CREATOR Artist）
│       ├── scrape-lyrics-utanet.ts     # Uta-Net 日文歌词抓取（cheerio）
│       ├── apply-lyrics-patches.ts     # 歌词合并引擎（保留人工数据）
│       └── fetch-portraits-gamedbs.ts  # imas.gamedbs.jp 官方头像抓取
│
├── docs/
│   ├── DESIGN-claude.md          # 设计系统文档
│   ├── phase1.md ~ phase6.md     # 各阶段实施记录
│
├── styles/                       # 旧配置（保留参考）
│   ├── genres.config.ts
│   └── series.config.ts
│
├── next.config.js                # 静态导出配置（Cloudflare Pages）
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── DEPLOY.md                     # 部署指南（三种方案）
├── tailwind.config.js            # Design System tokens + 6企划品牌色
└── tsconfig.json                 # strict + app/_archive 排除
```

---

## 🎯 当前已实现的功能

### 页面（12 个路由）
| 路由 | 类型 | 功能亮点 |
|---|---|---|
| `/` | Static (ISR) | 数据概览、最新发行网格、热门单曲、6企划卡片 |
| `/releases` | Static | Grid/List/Table 三视图、类型筛选、排序、实时搜索 |
| `/releases?series=x` | Static | 客户端按企划筛选（`useSearchParams`） |
| `/release/[id]` | Dynamic | 大封面 Hero、紧凑元数据行（ALBUM·Label·Catalog·Year）、Tracklist（BPM+时长+收藏）、Apple Music 外链、同企划推荐 |
| `/tracks` | Static | 单曲卡片网格、企划/BPM/可试听标签、关键词搜索、客户端企划筛选、排序 |
| `/track/[id]` | Dynamic | 封面 Hero、Credits（含艺人名解析 + 跳转链接）、歌词区块、BPM/时长/调性、播放按钮、收藏、相似曲目 |
| `/artists` | Static (ISR) | 角色筛选（偶像/组合/声优/创作者）、卡片网格 |
| `/artist/[id]` | Dynamic | 头像（官方图片/占位）、角色/企划标签、英文名、演唱曲目 + 创作曲目（含 Credits role 标签）、曲目/专辑统计 |
| `/search` | Static (ISR) | 大搜索框 autoFocus、分类 Tab、实时过滤 |
| `/explore` | Static (ISR) | 可视化功能收拢入口（曲风地图/时间线/对比/收藏） |
| `/explore/map` | Static (ISR) | Energy × Valence 散点图、企划色区分、Tooltip |
| `/favorites` | Client | localStorage 持久化、悬停删除 |

### 播放器
- [x] iTunes 30秒试听真实播放
- [x] 播放/暂停/进度条拖动
- [x] 音量调节 + 静音切换
- [x] 上一首/下一首
- [x] MINI 底部条 + EXPANDED 全屏抽屉（Framer Motion 动画）
- [x] 播放队列 UI（浮层、删除、清空）
- [x] 循环模式（顺序/列表/单曲）
- [x] 随机播放模式
- [x] 专辑封面主色提取（Canvas API）
- [x] 浏览器自动播放策略兼容

### 收藏
- [x] 首页热门单曲 ♥ 收藏
- [x] 单曲详情页 ♥ 收藏
- [x] 相似曲目 ♥ 收藏
- [x] 专辑 tracklist 每行 ♥ 收藏
- [x] `/favorites` 管理页（读取/删除）

### 交互优化
- [x] 全局键盘快捷键（Space/←→/↑↓/M/F）
- [x] Skeleton 加载态（track/release/artist 动态路由）
- [x] 播放器展开/收起 Framer Motion 动画

### 移动端体验（Phase 7 核心交付）
- [x] BottomNav 底部导航栏（4 Tab：首页/曲库/探索/收藏）
- [x] MobilePlayerSheet（全屏 Bottom Sheet，`y: 100% → 0%` 动画）
- [x] Swipe 手势：下拉关闭播放器、左右滑动切歌、队列拖拽关闭
- [x] History API `pushState`/`popstate` 拦截系统返回键
- [x] MobileTracklist 卡片式列表（release/favorites/artist 页面）
- [x] 筛选栏横向滚动、统计信息垂直堆叠（artists/search 页面）
- [x] 全局列表移动端适配与交互闭环

### 响应式
- [x] 桌面端：固定 Sidebar + 顶栏 + 底部播放器
- [x] 移动端（< 768px）：BottomNav + 汉堡菜单 + 全宽布局 + 触控优化

---

## 🗂️ 数据模型速查

### Track（曲目）
```typescript
interface Track {
  id: string
  titleJa: string          // 主要展示语言
  titleZh?: string
  titleRomaji?: string
  releaseId: string
  artistIds: string[]
  credits: { artistId: string; role: 'VOCALS'|'COMPOSER'|'LYRICIST'|'ARRANGER' }[]
  trackNumber: number
  durationSec?: number
  bpm?: number             // ⏸️ 待 Wiki 数据录入
  energy?: number          // 基于 BPM+调性的估算值
  valence?: number         // 同上
  key?: number             // Spotify API 标准 (0-11)
  mode?: number            // 0=minor, 1=major
  previewUrl?: string      // iTunes 30s 试听
  spotifyId?: string
  lyrics?: string
  description?: string
}
```

### Release（发行物）
```typescript
interface Release {
  id: string
  type: 'SINGLE' | 'ALBUM' | 'COMPILATION' | 'EP'
  titleJa: string
  series: '765'|'cinderella'|'million'|'sidem'|'shinycolors'|'gakuen'
  releaseDate?: string     // ISO 8601
  coverUrl?: string        // iTunes 600x600
  dominantColor?: string   // Canvas 提取（运行时）
  trackIds: string[]
  catalogNumber?: string
  label?: string
  format?: string
  appleMusicUrl?: string
}
```

### Artist（艺人）
```typescript
interface Artist {
  id: string
  nameJa: string          // 日文名（汉字为主）
  nameEn?: string         // 英文全名（西方顺序：名 姓）
  role: 'IDOL' | 'UNIT' | 'CV' | 'CREATOR'
  series?: string[]
  portraitUrl?: string    // 官方头像（imas.gamedbs.jp）
  trackIds?: string[]
  releaseIds?: string[]
}
```

---

## 🎨 设计系统速查

### 核心色板
| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--bg-page` | `#f5f4ed` | `#1a1a18` | 页面背景 |
| `--bg-surface` | `#faf9f5` | `#242422` | 卡片背景 |
| `--text-primary` | `#141413` | `#f0eee6` | 主文字 |
| `--text-secondary` | `#5e5d59` | `#b0aea5` | 次要文字 |
| `--color-terracotta` | `#c96442` | `#c96442` | 品牌强调 |
| `--border-default` | `#f0eee6` | `#3d3d3a` | 边框 |

### 企划品牌色
```
765AS:        #F34F6D  (粉红)
Cinderella:   #2681C8  (蓝)
Million Live: #FFC30B  (黄)
SideM:        #0FBE94  (青绿)
Shiny Colors: #8DBBFF  (浅蓝)
Gakuen:       #FF7F27  (橘)
```

### 字体
- 标题：`Georgia, Cambria, serif`（weight 500，绝不用 bold）
- 正文：`system-ui, -apple-system, sans-serif`
- 行高：body 1.60，heading 1.10-1.30

---

## 🧪 E2E 测试（Playwright）

```bash
# 首次安装浏览器
npx playwright install

# 运行全部测试（需先 npm run build）
npx playwright test

# 仅移动端
npx playwright test --project="Mobile iPhone SE"

# 查看 HTML 报告
npx playwright show-report
```

### 测试覆盖
| 场景 | iPhone SE | iPhone 14 Pro | Desktop |
|---|---|---|---|
| 首页加载 + 统计数据 | ✅ | ✅ | ✅ |
| 底部导航栏可见 | ✅ | ✅ | — |
| 侧边栏打开/关闭 | ✅ | ✅ | — |
| 专辑详情页 + 曲目列表 | ✅ | ✅ | ✅ |
| 曲目详情页 + Credits | ✅ | ✅ | ✅ |
| 底部导航 Tab 切换 | ✅ | ✅ | — |
| MobilePlayerSheet 展开/收起 | ✅ | ✅ | — |
| 播放器 Swipe 手势（下拉/左右） | ✅ | ✅ | — |
| 队列打开/关闭 | ✅ | ✅ | — |
| 切歌后封面更新（Bug A1） | ✅ | ✅ | — |
| 首页热门单曲可点击（Bug A2） | ✅ | ✅ | ✅ |
| **Phase 8 数据展示**（歌词/Credits/专辑元数据/艺人头像） | ✅ | ✅ | ✅ |

> 注：Desktop 端自动 skip 移动端专属测试（`isMobile` 条件）。测试数据使用静态导出中的真实 ID，若数据更新导致 ID 变化需同步更新 `e2e/*.spec.ts`。

---

## 🚀 部署指南

### 快速部署（已配置 GitHub Actions）
每次 `git push origin master` 自动构建并部署到 Cloudflare Pages。

Secrets 已配置：
- `CLOUDFLARE_API_TOKEN` ✅
- `CLOUDFLARE_ACCOUNT_ID` ✅

### 手动部署
```bash
npm run build
npx wrangler pages deploy dist --project-name=imas-music
```

详细指南见 [DEPLOY.md](DEPLOY.md)。

---

## 🔧 数据导入指南

### 1. 准备输入文件
创建 `data/seed/input/{series}-sample.txt`，每行一个曲目名：
```
# 注释以 # 开头
M@STERPIECE
READY!!
GO MY WAY!!
```

### 2. 运行脚手架
```bash
# 单曲模式
npx tsx scripts/seed-cli.ts \
  --input data/seed/input/765-sample.txt \
  --series 765 \
  --type track \
  --output data/seed/output/

# 专辑模式
npx tsx scripts/seed-cli.ts \
  --input data/seed/input/765-albums.txt \
  --series 765 \
  --type album
```

参数：
- `--input` 输入文件路径（必填）
- `--series` 企划 ID: 765|cinderella|million|sidem|shinycolors|gakuen（必填）
- `--type` track|album（默认 track）
- `--output` 输出目录（默认 data/seed/output/）
- `--delay` 请求间隔 ms（默认 1500）
- `--limit` 每词返回结果数（默认 5）

### 3. Wiki 数据合并
```bash
# 1. 把 Wiki 页面 Ctrl+A 保存到 data/seed/wiki-dumps/{曲名}.txt
# 2. 运行合并脚本
npx tsx scripts/merge-wiki-supplement.ts
```

### 4. Phase 8 自动化流水线
```bash
# 4.1 MusicBrainz Credits + Catalog/Label 抓取（两级：release → recording）
npx tsx scripts/pipeline-musicbrainz.ts --level=release
npx tsx scripts/pipeline-musicbrainz.ts --level=recording

# 4.2 VGMdb Credits 补充（MusicBrainz 缺失 Arranger 时触发）
npx tsx scripts/pipeline-vgmdb.ts

# 4.3 萌娘百科歌词批量抓取
npx tsx scripts/pipeline-lyrics-moegirl.ts

# 4.4 Wiki 歌词提取（需先准备 wiki-dumps）
npx tsx scripts/pipeline-lyrics-wiki.ts

# 4.5 偶像关系图谱深化
npx tsx scripts/pipeline-imasparql-v2.ts

# 4.6 最终合并（生成备份并写入主数据）
npx tsx scripts/pipeline-merge.ts
```

### 5. 已知问题
- 部分歌名在 iTunes 上不存在 → 会写入 `_errors.json`
- 搜索可能匹配到非偶像大师歌曲 → 需人工校对
- 建议查询词包含 `THE IDOLM@STER` 前缀（CLI 已自动追加）
- 歌词抓取涉及外部网站，需遵守各站点的 robots.txt 和访问频率限制

---

## 📝 待办清单

> **活跃任务与 Bug 修复已统一迁移至 [`docs/roadmap.md`](docs/roadmap.md)。本文档不再维护详细 TODO，请直接查阅路线图。**
>
> 活跃阶段：**Phase 8 — 远期规划与数据补全**（🚧 进行中）
>
> 已归档阶段：Phase 1~7 详见 `docs/phase1.md` ~ `docs/phase7.md`

---

## 🔗 关键外部依赖

- **iTunes Search API**: https://itunes.apple.com/search（无需认证）
- **imasparql**: https://sparql.crssnky.xyz/spql/imas/query（偶像档案数据源）
- **MusicBrainz**: https://musicbrainz.org/doc/MusicBrainz_API（开源音乐元数据库，Rate Limit 1 req/sec）
- **VGMdb**: https://vgmdb.net（日本游戏/动画音乐数据库，HTML 抓取）
- **Project iM@S Wiki**: https://project-imas.wiki（歌曲档案数据源，人工录入）
- **图片 CDN**: `is1-ssl.mzstatic.com` ~ `is5-ssl.mzstatic.com`

---

## 📜 设计文档

- [docs/DESIGN-claude.md](docs/DESIGN-claude.md) — Claude Design System 完整规范
- [docs/phase1.md](docs/phase1.md) ~ [docs/phase7.md](docs/phase7.md) — 各阶段实施记录
- [docs/phase8-planning.md](docs/phase8-planning.md) — Phase 8 自动化数据丰满规划书

---

*最后更新: 2026-04-28 | v0.5.0 — Phase 8 数据管道完成：Credits 71% / 歌词 47% / Catalog 57% / 头像 74%，5,193 静态页面，Cloudflare Pages 自动部署*
