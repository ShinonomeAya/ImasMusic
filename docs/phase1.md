# Phase 1: 地基铺设 (Foundation)

> 状态: ✅ COMPLETED
> 完成时间: 2026-04-22
> 目标: 建立技术栈、设计系统、全局布局壳子、状态管理骨架

---

## 任务清单

### 1. 依赖安装
- [x] shadcn/ui 核心依赖 (class-variance-authority, clsx, tailwind-merge)
- [x] Radix UI 基础组件 (@radix-ui/react-slot, separator, tooltip, dialog, dropdown-menu, tabs, slider)
- [x] 动画/状态/查询库 (framer-motion, zustand, next-themes, nuqs, @tanstack/react-query, @tanstack/react-virtual)

### 2. 配置文件更新
- [x] `next.config.js` → 添加 iTunes CDN remotePatterns (is1-ssl.mzstatic.com 等 6 个 hostname) + 开启图片优化 (unoptimized: false)
- [x] `tailwind.config.js` → 追加 6 企划品牌色 brand.765/cinderella/million/sidem/shinycolors/gakuen + 动画 keyframes
- [x] `globals.css` → 保留 Claude Design System，追加企划品牌 CSS 变量 + --bg-page-rgb + 更新暗色 Tone-matching

### 3. 核心工具与数据
- [x] `lib/utils.ts` — cn() 工具函数 (clsx + tailwind-merge)
- [x] `lib/series.ts` — SERIES_CONFIG 数组 + SERIES_MAP，含 6 企划完整信息

### 4. 状态管理
- [x] `lib/store/playerStore.ts` — Zustand + persist，含完整 PlayerState 和 Actions

### 5. 类型定义
- [x] `types/index.ts` — Track / Release / Artist / PlayerState / NavItem / SeriesConfig 接口
  - Track 含 energy/valence/bpm/key/mode (Spotify API 标准)
  - Release 含 type: SINGLE | ALBUM | COMPILATION | EP
  - Artist 含 role: IDOL | UNIT | CV | CREATOR

### 6. 布局组件
- [x] `components/layout/ThemeProvider.tsx` — next-themes wrapper，支持 class/enableSystem
- [x] `components/layout/Sidebar.tsx` — 固定侧边栏
  - Logo (iM@S Archive)
  - 顶部导航: 探索 / 全部系列
  - 企划列表: 6 大企划，含品牌色高亮 + active indicator + hover 动效
  - 底部: 收藏 + 暗色模式切换按钮
  - 动态 CSS 变量 --active-brand 平滑过渡
- [x] `components/layout/TopAppBar.tsx` — sticky 顶栏
  - 标题 Discography
  - 主导航: 发现 / 专辑 / 单曲 / 艺人 / 创作者
  - 搜索框 (带 ⌘K 快捷键提示)
  - 毛玻璃背景 (backdrop-blur)
- [x] `components/layout/BottomPlayer.tsx` — 底部播放器
  - HIDDEN: 不显示
  - MINI: 底部固定条，含封面/曲目信息/播放控制/进度条/展开按钮
  - EXPANDED: 全屏抽屉面板，含大封面/泛光背景/Credits 预览

### 7. 全局布局重构
- [x] `app/layout.tsx` — 新布局组合: ThemeProvider > Sidebar + div(ml-64) > TopAppBar + main + Footer + BottomPlayer
- [x] `app/page.tsx` — 临时首页，验证布局正常工作

### 8. 构建验证
- [x] `npm run type-check` — 零错误通过
- [x] `npm run build` — 生产构建成功，所有路由正常生成

---

## 设计决策记录

| 决策 | 说明 |
|---|---|
| 主题 | 默认亮色 (Warm Editorial), 暗色 Tone-matching (#1a1a18 深暖黑) |
| 企划色 | 765 #F34F6D, CG #2681C8, ML #FFC30B, SM #0FBE94, SC #8DBBFF, GK #FF7F27 |
| 动态高亮 | --active-brand CSS 变量，企划切换时全站高亮色平滑过渡 |
| 播放状态 | HIDDEN \| MINI \| EXPANDED，Zustand 持久化 volume + view |
| 旧路由 | 保留原有路由 (/series, /song, /genre 等)，后续阶段逐步迁移或重定向 |

---

## 下一阶段入口

→ [docs/phase2.md](./phase2.md)
