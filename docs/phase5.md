# Phase 5 — 核心功能修复与详情页体系

> 状态：🚧 待执行 | 前置条件：Phase 1-4 已完成，检查修复已完成

## 目标

修复影响用户体验的核心 Bug，补齐缺失的单曲详情页，完善分类体系，使项目从"可浏览"升级为"可深度使用"。

---

## 已完成的前置工作（检查阶段）

在本次 Phase 5 规划前，已完成一轮完整检查与修复：

| 修复项 | 说明 |
|---|---|
| `/series/[id]` 路由 | 新建页面，修复首页企划卡片 404 |
| `artist/[id]` import 错误 | `getReleaseById` → `getTrackById` |
| `release.trackIds` 回填 | 16/16 releases 已填充正确 track ID |
| TypeScript 类型检查 | ✅ 通过 |
| Next.js 生产构建 | ✅ 通过，10 个路由 |

---

## P0 — 致命 Bug（阻塞使用）

### 5.1 播放功能完全失效

**问题描述：** 首页"可试听曲目"和专辑详情页的播放按钮点击后没有任何反应，底部播放器不会出现，音频不会播放。

**根因：** `app/page.tsx` 的播放按钮是纯 `<button>`，没有绑定 `onClick` 事件，未调用 `usePlayerStore.setTrack()`。专辑详情页 `app/release/[id]/page.tsx` 的曲目列表也没有播放按钮。

**修复方案：**
- 首页播放按钮添加 `onClick={() => usePlayerStore.getState().setTrack(track)}`
- 专辑 tracklist 每个曲目左侧添加小号播放按钮（圆形，terracotta 背景）
- **注意事件冒泡**：如果曲目行整体设为 `<Link>`，播放按钮内需 `e.preventDefault() + e.stopPropagation()`

**涉及文件：**
- `app/page.tsx` — 可试听曲目区域
- `app/release/[id]/page.tsx` — 收录曲目区域

---

### 5.2 专辑 tracklist 无交互入口

**问题描述：** 专辑详情页的曲目列表是纯展示，用户既不能播放单曲，也不能点击进入单曲详情。

**修复方案：**
- 每个曲目行左侧添加小号播放按钮
- 曲名改为 `<Link href={`/track/${track.id}`}>` 链接
- 鼠标悬停时行背景高亮，提示可交互

**涉及文件：**
- `app/release/[id]/page.tsx`

---

## P1 — 缺失的详情页

### 5.3 新建单曲详情页 `/track/[id]`

**问题描述：** 单曲没有独立详情页。构建路由中不存在 `/track/[id]`。

**设计参考：** `yuanxing/Track Detail.html`（**适当调整，非照搬**）

**页面结构（适配 Warm Editorial）：**

```
┌─────────────────────────────────────────────┐
│  Hero Section (md:flex-row)                 │
│  ┌─────────┐  ┌──────────────────────────┐  │
│  │ 封面大图 │  │ 企划标签 + 组合标签       │  │
│  │ 1:1     │  │ 曲名 (text-subheading-lg) │  │
│  │         │  │ 演唱者                    │  │
│  │         │  │ [▶ Listen]  [♡ Save]     │  │
│  └─────────┘  └──────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Content Grid (lg:grid-cols-3 gap-12)       │
│  ┌────────────────┐ ┌─────────────────────┐ │
│  │ Credits 面板    │ │ Musical Analysis    │ │
│  │ ─────────────── │ │ ─────────────────── │ │
│  │ Vocals    xxx   │ │ 乐评长文本段落       │ │
│  │ Lyricist  xxx   │ │                     │ │
│  │ Composer  xxx   │ │ (需新增 description  │ │
│  │ Arranger  xxx   │ │  字段到 Track 类型)  │ │
│  │ ─────────────── │ │                     │ │
│  │ BPM  Key 卡片   │ └─────────────────────┘ │
│  └────────────────┘                         │
├─────────────────────────────────────────────┤
│  Similar Tracks                             │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │封面│ │封面│ │封面│  横向滚动或网格        │
│  └────┘ └────┘ └────┘                      │
└─────────────────────────────────────────────┘
```

**设计适配要点：**
| 原型元素 | 我们的适配 |
|---|---|
| M3 圆角卡片 | 改为 `rounded-very` + `border: var(--border-default)` |
| M3 surface 色 | 改为 `var(--bg-surface)` |
| Newsreader 字体 | 保留 Georgia serif（weight 500） |
| Material Symbols | 改为 Lucide React 图标 |
| 亮色/暗色 | 使用 `next-themes` class 切换 |

**数据需求：**
- `track.credits` — 已有，但当前数据多为空数组
- `track.bpm` / `track.key` / `track.mode` — 已有，待 Phase 6 填充
- `track.description` — **需新增字段**，乐评/分析文本
- `track.previewUrl` — 已有，用于 Listen 按钮

**涉及文件：**
- 新建 `app/track/[id]/page.tsx`
- `types/index.ts` — 新增 `description?: string`

---

### 5.4 单曲独立入口

**问题描述：** 当前"单曲"被淹没在"发行物"中。主页和导航都没有独立的"单曲"分类入口。

**修复方案（方案 A — 轻量）：**
- 首页增加"热门单曲"独立板块（类似"最新发行"）
- 展示前 8 首有 `previewUrl` 的 track
- 每个卡片包含：封面（取自所属 release）、曲名、演唱者、播放按钮

**涉及文件：**
- `app/page.tsx` — 新增热门单曲板块

---

## P2 — 筛选与分类

### 5.5 艺人筛选按钮功能化

**问题描述：** `/artists` 页面的 4 个角色筛选按钮（偶像/组合/声优/创作者）是纯静态装饰，点击后没有任何反应。

**修复方案：**
- 添加 `useState<ArtistRole | 'ALL'>` 管理当前筛选
- 点击按钮时更新筛选状态，高亮当前选中的按钮
- 根据筛选状态过滤 `artists` 数组渲染

**涉及文件：**
- `app/artists/page.tsx`

---

## P3 — 数据填充（全自动）

### 5.6 艺人数据导入（imasparql 全自动）

**问题描述：** `data/artists.json` 为空数组，`/artists` 和 `/artist/[id]` 页面无法展示任何内容。

**数据来源：** `https://sparql.crssnky.xyz/spql/imas/query`

**可用数据（已探明）：**
- 353 个偶像，覆盖全部 9 个 Brand
- 日英双语名字
- Brand、生日、身高、血型、代表色 (Color)、爱好 (Hobby) 等
- `memberOf` 属性可关联到 Unit

**不可用的数据（已排除）：**
- 歌曲 BPM/作词/作曲/编曲（imasparql 中不存在这些字段）

**导入策略：**
- 写 `scripts/seed-idols.ts` 从 imasparql 抓取全部 353 人
- 按 Brand 分类写入 `data/artists.json`
- 角色映射：Brand 归属 + 判断逻辑 → IDOL/UNIT/CV/CREATOR

**涉及文件：**
- 新建 `scripts/seed-idols.ts`
- `data/artists.json`

---

### 5.7 Track 数据模型扩展

**新增字段：**
```typescript
interface Track {
  // ... 现有字段 ...
  /** 乐评/音乐分析文本 */
  description?: string
}
```

**用途：** 单曲详情页的 Musical Analysis 区域。

**填充策略：** Phase 5 先留空，框架支持即可。Phase 6 可接入内容。

---

## 明确不在 Phase 5 的工作

以下工作已确认移至 **Phase 6**：

| 工作项 | 原因 |
|---|---|
| Wiki/萌娘百科 歌曲档案录入 | 无法自动化，需人工；与页面功能开发解耦 |
| Cinderella Girls / SideM / Gakuen 数据导入 | 数据层扩展，不影响现有页面功能 |
| Spotify API 替代方案 | 已放弃 Spotify，Phase 6 评估 Wiki/萌娘百科补充 |
| 播放队列 UI | 功能增强，非阻塞 |
| 收藏功能完整化 | 功能增强，非阻塞 |
| 曲风可视化 | 依赖音频特征数据，Phase 6 才有 |
| Framer Motion 动画 | 等 Phase 5 功能稳定后再做 |
| Skeleton 加载态 | 等 Phase 5 功能稳定后再做 |

---

## 任务优先级汇总

| 优先级 | 任务 | 工作量 | 阻塞关系 |
|---|---|---|---|
| **P0** | 5.1 修复播放功能 | 小 | 无 |
| **P0** | 5.2 专辑 tracklist 交互 | 小 | 依赖 5.1 |
| **P1** | 5.3 单曲详情页 | 中 | 依赖 5.2 |
| **P1** | 5.4 单曲独立入口 | 小 | 无 |
| **P2** | 5.5 艺人筛选功能化 | 小 | 无 |
| **P3** | 5.6 imasparql 偶像导入 | 中 | 无 |
| **P3** | 5.7 Track 字段扩展 | 极小 | 无 |

---

## 验收标准

- [ ] 首页点击播放按钮后，底部播放器出现并开始播放
- [ ] 专辑页点击曲目播放按钮后，能播放该曲目
- [ ] 专辑页点击曲名，能跳转到单曲详情页
- [ ] 单曲详情页能正确展示 Credits、BPM、Key 等字段（有数据时）
- [ ] 艺人页筛选按钮点击后能按角色过滤（有数据时）
- [ ] `/artists` 页面至少展示 50 条以上艺人数据

---

*文档更新: 2026-04-22 | 检查修复完成，Phase 5 范围已冻结*
