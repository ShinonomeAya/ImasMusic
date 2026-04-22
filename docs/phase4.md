# Phase 4: 播放器实现 + 数据扩充 + UI 打磨

> 状态: ✅ COMPLETED
> 完成时间: 2026-04-22
> 前置依赖: Phase 1-3 ✅
> 目标: 实现真实音频播放、导入多企划数据、移动端适配

---

## 任务清单

### 1. 真实音频播放器 ✅
- [x] 重构 `components/layout/BottomPlayer.tsx`
  - HTML5 `<audio>` 元素管理（useRef）
  - 播放/暂停/进度条/音量控制（range input）
  - 曲目切换（上一首/下一首）
  - 30秒试听自动结束处理（ended 事件）
  - 浏览器自动播放策略兼容（catch play() 失败）
  - EXPANDED 抽屉面板完整播放控制
  - 音量图标切换（Volume2 / VolumeX）

### 2. 数据大规模导入 ✅
- [x] 765AS: 9 tracks, 8 releases
- [x] Shiny Colors: 4 tracks, 4 releases（4 条未匹配）
- [x] Million Live: 7 tracks, 4 releases（1 条未匹配）
- [x] 合并后总计: **18 tracks, 16 releases**
- [x] Node.js 去重合并脚本（按 id 去重）

### 3. 移动端响应式适配 ✅
- [x] Sidebar 移动端折叠为抽屉（汉堡菜单 + backdrop + 滑动动画）
- [x] 顶栏移动端适配（ml-12 避让汉堡按钮）
- [x] 主内容区 `md:ml-64` 响应式边距
- [x] 播放器底部条全宽适配

### 4. 视觉打磨（部分完成）
- [ ] 专辑主色提取（fast-average-color）— 移至阶段五
- [ ] 详情页 Glassmorphism 动态背景 — 移至阶段五

---

## 当前数据概览

| 企划 | 曲目数 | 状态 |
|---|---|---|
| 765AS | 9 | ✅ 已导入 |
| Shiny Colors | 4 | ✅ 已导入 |
| Million Live | 5 | ✅ 已导入（部分匹配重复）|
| 合计 | 18 tracks, 16 releases | — |

---

## 播放器功能清单

| 功能 | 状态 |
|---|---|
| 点击播放（MINI 条 + EXPANDED） | ✅ |
| 真实音频播放（iTunes 30s preview） | ✅ |
| 进度条拖动 | ✅ |
| 音量调节 | ✅ |
| 静音切换 | ✅ |
| 上一首/下一首 | ✅ |
| 播放结束自动停止 | ✅ |
| 浏览器自动播放限制处理 | ✅ |

---

## 响应式断点

| 断点 | 变化 |
|---|---|
| `< md (768px)` | Sidebar 隐藏 → 汉堡菜单抽屉；顶栏左侧缩进；网格 1-2 列 |
| `≥ md` | Sidebar 固定展示；顶栏正常布局；网格 3-5 列 |

---

## 下一阶段建议

**阶段五** 可选方向：
1. **数据可视化** — 曲风地图 / 时间线 / 系列对比（需要 Spotify audio-features）
2. **UI Polishing** — 专辑主色提取、Framer Motion 动画、Skeleton 加载态
3. **更多数据导入** — Cinderella Girls / SideM / Gakuen
4. **播放器增强** — 播放队列管理、循环/随机模式
