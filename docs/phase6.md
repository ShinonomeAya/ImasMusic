# Phase 6 — 数据层扩展与深度功能

> 状态：📋 规划中 | 前置条件：Phase 5 全部完成

## 目标

在 Phase 5 核心功能稳定运行的基础上，完成数据层的全面扩展（艺人档案、歌曲档案、多企划数据），并引入增强体验的功能（动画、可视化、交互优化）。

---

## P1 — 歌曲档案数据补充（人工 + 半自动）

### 6.1 Project iM@S Wiki / 萌娘百科 数据录入

**背景：** 经全面技术探查（9 个数据源测试），确认**没有任何自动化 API** 可提供 iM@S 歌曲的 BPM/作词/作曲/编曲。Project iM@S Wiki 和萌娘百科是**唯二**拥有完整档案数据的数据源，但均被反爬机制保护，无法自动化获取。

**数据来源对比：**

| 来源 | 语言 | 访问方式 | 优势 | 劣势 |
|---|---|---|---|---|
| **Project iM@S Wiki** | 英文 | 浏览器手动访问 | 数据最权威、格式最标准、覆盖面最全 | 英文界面，部分曲名为罗马音 |
| **萌娘百科** | 中文 | 浏览器手动访问 | 中文友好，便于核对 | 覆盖不如 Wiki 全面，格式不统一 |

**录入格式：**

创建 `data/seed/wiki-supplement.txt`：

```
# 格式：曲名 | BPM | 作词 | 作曲 | 编曲 | 来源(Wiki/萌娘)
M@STERPIECE | 128 | yura | Satoru Kousaki | Satoru Kousaki, Ryuichi Takada | Wiki
READY!! | 178 | yura | Satoru Kousaki | Satoru Kousaki | Wiki
GO MY WAY!! | 180 | yura | Satoru Kousaki | Satoru Kousaki | Wiki
Study Equal Magic! | 140 | 松井洋平 | 石井健太郎 | 石井健太郎 | 萌娘
```

**合并脚本：**
- 新建 `scripts/merge-wiki-supplement.ts`
- 按曲名匹配已有 track
- 将 BPM/作词/作曲/编曲写入 `track.credits` 和 `track.bpm`
- 支持增量更新（已有数据不覆盖，除非显式强制）

**工作量策略：**
- 不追求一次性录入全部
- 按优先级分批：765AS 核心曲目 → Million Live 核心曲目 → Shiny Colors 核心曲目 → 其他
- 每批 20-30 首，利用碎片时间完成

---

### 6.2 更多数据导入（iTunes 脚手架）

**目标：** 扩大曲目和发行物覆盖范围。

**待导入企划：**
- Cinderella Girls（灰姑娘女孩）
- SideM
- Gakuen（学园偶像大师）

**执行方式：**
```bash
# 1. 准备输入文件
# data/seed/input/cinderella-sample.txt
# data/seed/input/sidem-sample.txt
# data/seed/input/gakuen-sample.txt

# 2. 运行 iTunes 脚手架
npx tsx scripts/seed-cli.ts --input data/seed/input/cinderella-sample.txt --series cinderella
n
# 3. 合并到主数据
npx tsx scripts/merge-tracks.ts --source data/seed/output/xxx_tracks.json --target data/tracks.json
```

**注意：** 导入后需要人工校对 `series` 字段（iTunes 返回的专辑可能标注错误）。

---

### 6.3 数据质量修复

**已知问题：**

| 问题 | 影响 | 修复方案 |
|---|---|---|
| 部分 release `series` 标注错误 | SideM/Shiny Colors 内容被标为 765 | 人工校对，写脚本批量修正 |
| track `artistIds` 存的是长文本 | 非结构化，无法反向关联艺人 | 保留原文本用于展示，新增 `artistIdRefs` 字段存真实 ID |
| release `trackIds` 已填充但可能不完整 | 某些 release 关联的 track 可能遗漏 | 运行验证脚本检查孤儿 track |

---

## P2 — 功能增强

### 6.4 播放队列 UI

**现状：** Zustand store 已有 `queue` 和 `queueIndex` 字段，但没有任何 UI。

**实现：**
- MINI 播放器右侧添加队列展开按钮
- 展开后显示当前队列列表（最多 20 首）
- 支持拖拽排序、删除、清空

---

### 6.5 收藏功能完整化

**现状：** `/favorites` 页面能读取/删除 localStorage 数据，但其他页面没有"♥ 加入收藏"入口。

**实现：**
- 单曲详情页：Listen 按钮旁添加 ♥ Save 按钮
- 专辑 tracklist：每行右侧添加 ♥ 按钮
- 首页可试听曲目：添加 ♥ 按钮
- 收藏状态持久化到 `localStorage`

---

### 6.6 曲风可视化（待数据就绪）

**依赖：** `track.energy` 和 `track.valence` 字段有数据。

**当前状态：** 这些字段为空（Spotify API 已放弃，Wiki 不提供 energy/valence）。

**可能方案：**
- 方案 A：手动给热门曲目标注粗略的 energy/valence（1-10 分制）
- 方案 B：使用音频分析库（如 essentia.js）在浏览器端分析 previewUrl 提取特征
- 方案 C：等 Wiki 数据录入完成后，根据 BPM + 作曲者风格做近似分类

**建议：** Phase 6 先实现可视化框架（页面 + 图表），数据用 mock 填充，等真实数据就绪后替换。

---

### 6.7 Framer Motion 动画

**引入时机：** Phase 5 功能全部稳定后再引入，避免动画掩盖功能问题。

**优先级：**
1. 播放器 EXPANDED 展开动画（layoutId 实现封面从小变大）
2. 页面切换过渡
3. 列表过滤动画

---

### 6.8 Skeleton 加载态

**场景：**
- 动态路由（`/release/[id]`、`/artist/[id]`、`/series/[id]`）的 loading.tsx
- 客户端组件的数据加载等待期

---

### 6.9 专辑主色提取

**方案：**
- 使用 Canvas API 读取 `coverUrl`，提取主色
- 写入 `release.dominantColor`
- 用于播放器 EXPANDED 态的背景氛围色、系列页面的主题色

---

## P3 — 交互优化

### 6.10 键盘快捷键

| 快捷键 | 功能 |
|---|---|
| `Space` | 播放/暂停 |
| `←` / `→` | 上一首/下一首 |
| `↑` / `↓` | 音量增减 |
| `M` | 静音切换 |
| `F` | 播放器展开/收起 |

---

### 6.11 循环/随机播放模式

**状态存储：** 加入 `PlayerStore`：
```typescript
repeatMode: 'none' | 'all' | 'one'
shuffle: boolean
```

---

## P4 — 长期规划（Phase 7+）

| 功能 | 说明 |
|---|---|
| PWA 支持 | 离线缓存、安装到桌面 |
| 多语言切换 | 日/中/英展示切换（不影响数据存储语言） |
| 用户账号系统 | 替换 localStorage 收藏为云端（Supabase/Clerk） |
| 评论/笔记 | 用户对单曲的个人笔记 |
| 数据统计面板 | 个人听歌统计、收藏分析 |

---

## 数据层演进路线

```
Phase 5 结束时:
  tracks: ~18      (765AS + ML + SC 核心曲目)
  releases: ~16    (同上)
  artists: ~353    (imasparql 全自动导入)

Phase 6 结束时目标:
  tracks: ~100+    (补充 CG / SideM / Gakuen + Wiki 档案数据)
  releases: ~80+   (同上)
  artists: ~353    (完整)
  credits: ~50+    (核心曲目 BPM/作词/作曲/编曲)
```

---

*文档创建: 2026-04-22 | Wiki/萌娘百科录入方案已确认，移至 Phase 6*
