# 项目路线图 — 活跃任务总览

> **读取说明**：本文档只包含当前待办与进行中的工作。已完成的阶段见下方「归档区」链接。
> **最后更新**：2026-04-27

---

## 📦 归档阶段（已完成，供追溯）

| 阶段 | 状态 | 核心交付 | 详细文档 |
|---|---|---|---|
| Phase 1 | ✅ | 设计系统、全局布局壳子、Zustand 状态、类型定义 | [phase1.md](./phase1.md) |
| Phase 2 | ✅ | iTunes API 封装、数据导入脚手架、统一数据层 `lib/data.ts` | [phase2.md](./phase2.md) |
| Phase 3 | ✅ | 发行物/艺人/搜索/探索/收藏页面（12 个路由） | [phase3.md](./phase3.md) |
| Phase 4 | ✅ | 真实音频播放器、多企划数据导入、移动端响应式骨架 | [phase4.md](./phase4.md) |
| Phase 5 | ✅ | 播放功能修复、单曲详情页 `/track/[id]`、艺人筛选、imasparql 导入 344 艺人 | [phase5.md](./phase5.md) |
| Phase 6 | ✅ | 播放队列 UI、收藏完整化、曲风可视化、Framer Motion 动画、Skeleton 加载态、专辑主色提取、键盘快捷键、循环/随机模式 | [phase6.md](./phase6.md) |
| Phase 7 | ✅ | 移动端全屏播放器、Swipe 手势、全局列表移动端适配与交互闭环 | [phase7.md](./phase7.md) |

**原始 Bug 记录**（已修复归档）：[bugs-archive.md](./bugs-archive.md)

---

## 🔥 当前阶段：Phase 8 — 自动化数据丰满与架构升级

> **战略口号：告别手动录入，全面走向 API 自动化流水线。**
>
> 在移动端 UI 与交互彻底打磨稳固的基础上，接下来的重心是**数据层自动化扩展**与**长期功能建设**。
> 3,403 首歌曲的 Credits、734 张专辑的 Catalog Number、344 位艺人的头像——纯人工录入不现实。
> 引入 **MusicBrainz API** 和 **VGMdb** 作为核心自动化数据源，构建本地脚本流水线，在构建前完成数据融合。
>
> 详细技术规划见 [`docs/phase8-planning.md`](./phase8-planning.md)。

---

### Sprint 8.1 — 自动化数据流水线 🚧 准备中

> 目标：Credits（作词/作曲/编曲）+ 歌词（中文/日文/英文）+ Catalog/Label，三线并行。

| 任务 | 说明 | 状态 | 预估 |
|---|---|---|---|
| 8.1a MusicBrainz 基础设施 | 封装 API 客户端（Release-level + Recording-level 两级） | ⏳ 待开始 | 2 天 |
| 8.1b Release-level 批量打底 | 按 Release 均摊 Credits，回填 Catalog/Label | ⏳ 待开始 | 4 天 |
| 8.1c Recording-level 精修 | 按 Recording 精确匹配 Credits，track-by-track 验证 | ⏳ 待开始 | 4 天 |
| 8.1d VGMdb 补充 + Credits 合并 | 补充缺失的 Arranger，smart merge 写入 tracks.json | ⏳ 待开始 | 3 天 |
| 8.1e 萌娘百科歌词抓取 | Playwright 批量抓取中文歌词（与 Credits 并行） | ⏳ 待开始 | 4 天 |
| 8.1f Wiki 歌词提取 + 歌词合并 | 扩展 parse-wiki-dump.ts，合并歌词到 tracks.json | ⏳ 待开始 | 3 天 |

**验收标准**: Credits ≥ 75% · 歌词 ≥ 30% · Catalog Number ≥ 50% · Label ≥ 30% · 冲突率 ≤ 5%

### Sprint 8.2 — 艺人与企划数据深化（imasparql v2）🚧 准备中

> 目标：建立 Idol ↔ CV ↔ Unit 完整关系图谱，头像双源抓取（角色立绘优先 + CV 照片 fallback），代表色标准化。

| 任务 | 说明 | 状态 | 预估 |
|---|---|---|---|
| 8.2a imasparql 关系深化 | 抓取 CV 关联、Unit 成员、Hex 色标准化 | ⏳ 待开始 | 3 天 |
| 8.2b 头像双源抓取 | Project iM@S Wiki 角色立绘（primary）+ Wikidata CV 照片（fallback） | ⏳ 待开始 | 4 天 |
| 8.2c 艺人页 UI 升级 | 头像、代表色背景、关系卡片（配音角色 / 所属组合） | ⏳ 待开始 | 3 天 |

**验收标准**: Idol↔CV 关联 72.5% · Portrait ≥ 60%（双源）· Color Hex 标准化 100%

### Sprint 8.3 — PWA 支持 🚧 准备中

| 任务 | 说明 | 状态 | 预估 |
|---|---|---|---|
| 8.3a PWA 配置 | manifest.json + sw.js + 图标 | ⏳ 待开始 | 3 天 |

**验收标准**: Lighthouse PWA ≥ 90 · 离线可访问首页/收藏

### Sprint 8.4 — 回归验收 🚧 准备中

| 任务 | 说明 | 状态 |
|---|---|---|
| 全量 E2E 回归测试 | Playwright 13 项测试全部通过 | ⏳ 待开始 |
| 数据质量报告 | Credits/歌词/Catalog/Label/Portrait 各维度覆盖率 | ⏳ 待开始 |
| README & 文档更新 | 版本号 v0.5.0、数据状态、新功能说明 | ⏳ 待开始 |

---

### 远期储备（Phase 9 候选）

| 方向 | 说明 |
|---|---|
| Spotify 声学特征 | BPM / Energy / Valence 真实数据（需 Client ID/Secret） |
| 多语言切换 | 日/中/英界面展示切换（不影响数据存储语言） |
| 用户账号系统 | 替换 localStorage 收藏为云端（Supabase/Clerk） |
| 评论/笔记 | 用户对单曲的个人笔记 |
| 数据统计面板 | 个人听歌统计、收藏分析 |

---

## 📁 文档索引

| 文件 | 用途 |
|---|---|
| `README.md` | 项目总览、快速上手、数据模型速查 |
| `docs/DESIGN-claude.md` | 设计系统完整规范（色板/字体/组件/布局） |
| `docs/roadmap.md` | **本文档 — 活跃任务总览** |
| `docs/phase1.md` ~ `docs/phase7.md` | 各阶段原始实施记录（归档） |
| `docs/bugs-archive.md` | 已归档 Bug 记录（含根因分析与修复方向） |
| `DEPLOY.md` | 部署指南 |

---

*此文档替代已合并的 `docs/bugs.md`。如有新 Bug，按优先级追加到对应 Sprint 中。*
