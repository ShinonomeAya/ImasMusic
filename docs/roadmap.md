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

## 🔥 当前阶段：Phase 8 — 远期规划与数据补全

> 在移动端 UI 与交互彻底打磨稳固的基础上，接下来的战略重心是**数据层扩展**与**长期功能建设**。
> 避免"一边录数据发现缺字段，一边又要回去改 UI"的来回折腾。

---

### P1 — 数据层扩展

| 功能 | 说明 | 状态 |
|---|---|---|
| Wiki / 萌娘百科 数据录入 | 人工录入 BPM/作词/作曲/编曲，脚本自动合并到 tracks | ⏳ 待开始 |
| 更多数据导入 | Cinderella Girls / SideM / Gakuen 完整曲目（iTunes 脚手架） | ⏳ 待开始 |
| 数据质量修复 | release `series` 标注错误、track `artistIds` 结构化 | ⏳ 待开始 |

### P2 — 功能增强

| 功能 | 说明 | 状态 |
|---|---|---|
| 页面切换过渡动画 | Framer Motion 页面级过渡（AnimatePresence + layout） | ⏳ 待开始 |
| 列表过滤动画 | 筛选/排序时的列表重排动画 | ⏳ 待开始 |
| PWA 支持 | Service Worker、离线缓存、安装到桌面 | ⏳ 待开始 |

### P3 — 国际化与账号

| 功能 | 说明 | 状态 |
|---|---|---|
| 多语言切换 | 日/中/英界面展示切换（不影响数据存储语言） | ⏳ 待开始 |
| 用户账号系统 | 替换 localStorage 收藏为云端（Supabase/Clerk） | ⏳ 待开始 |
| 评论/笔记 | 用户对单曲的个人笔记 | ⏳ 待开始 |
| 数据统计面板 | 个人听歌统计、收藏分析 | ⏳ 待开始 |

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
