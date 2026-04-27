# 已知 Bug 记录

> 以下问题已由代码审查确认根因，**尚未修复**，按优先级排序。修复前请先阅读对应分析。

---

## 🔴 P0 — 播放页面切歌不会更改封面和主题色

**发现时间**: 2026-04-23

**问题描述**: 在 BottomPlayer 展开状态（EXPANDED）下，点击「上一首」或「下一首」切换歌曲后，封面图片和背景主题色仍显示上一首的内容，没有跟随更新。

**复现步骤**:
1. 播放任意歌曲，点击展开播放器
2. 点击下一首（⏭）或上一首（⏮）
3. 观察封面图片和背景渐变颜色 → 未变化

**根因分析**:
- `lib/store/playerStore.ts` 第 140-145 行（`playNext`）和第 170-175 行（`playPrev`）在切歌时只更新了 `currentTrack`、`queueIndex`、`currentTime`、`isPlaying`
- **遗漏了 `currentCoverUrl` 的更新** — `setTrack()` 方法（第 102 行）会正确设置它，但 `playNext`/`playPrev` 绕过了 `setTrack`，直接调用 `set()`
- `BottomPlayer.tsx` 第 58-67 行的主题色提取 `useEffect` 监听的是 `currentCoverUrl`，由于该值未变，主题色不重新计算

**修复方向**:
在 `playNext` 和 `playPrev` 的 `set()` 调用中加入 `currentCoverUrl: nextTrack.coverUrl ?? ''`。

---

## 🔴 P0 — 手机端播放界面滑动退出异常（触发浏览器返回而非关闭播放器）

**发现时间**: 2026-04-23

**问题描述**: 手机端（iPhone/Android）打开播放器全屏界面后，从屏幕左侧边缘向右滑（系统返回手势），浏览器会直接退回上一页，而不是关闭播放器展开界面。

**复现步骤**:
1. 手机端访问站点，播放任意歌曲
2. 点击 Mini Player 展开全屏播放器
3. 从屏幕左边缘向右滑动 → 触发浏览器 history back，整个站点返回上一页

**根因分析**:
- `BottomPlayer.tsx` 第 340-349 行虽绑定了 `onTouchStart`/`onTouchMove` 用于「向下滑动关闭播放器」，但存在三处缺失：
  1. **未阻止浏览器默认手势**: `onTouchMove` 中未调用 `e.preventDefault()`，系统级侧滑返回手势未被拦截
  2. **无 CSS 防护**: 没有 `touch-action: none` 或 `overscroll-behavior: contain` 禁用默认 overscroll/back navigation
  3. **无 History API 绑定**: 播放器展开时未 `history.pushState()`，浏览器后退栈中不存在播放器状态，侧滑直接执行页面返回
- React synthetic touchmove 默认 passive，即使加 `preventDefault()` 也可能被浏览器忽略

**修复方向**:
- 方案 A（推荐）: 播放器展开时调用 `history.pushState({ player: true }, '')`，关闭时 `history.back()`，让浏览器后退自然映射到关闭播放器
- 方案 B: 在播放器容器上添加 `touch-action: none` + `overscroll-behavior-x: none`，并在 `useEffect` 中用原生 `addEventListener(..., { passive: false })` 阻止水平滑动默认行为

---

## 🟡 P1 — 播放界面和 Mini 播放栏动画逻辑异常

**发现时间**: 2026-04-23

**问题描述**: Mini Player 与 Expanded Player 之间的过渡动画存在多处不协调：切换有断档感、封面闪烁、队列浮层定位异常。

**根因分析**:
1. **`AnimatePresence mode="wait"` 导致断档** (`BottomPlayer.tsx` 第 161 行)
   - MINI 必须完全 exit（`y: 80, opacity: 0`）后 EXPANDED 才开始 enter
   - 视觉上看到"播放器消失再重新出现"，而非连贯变形
2. **`layoutId` 共享动画失效** (第 180 行、第 405 行)
   - 封面图片在 MINI ↔ EXPANDED 之间使用 `layoutId="player-cover"` 意图做共享元素过渡
   - `mode="wait"` 下旧元素完全卸载后才挂载新元素，Framer Motion 无法执行 layout morph
3. **队列浮层定位异常** (第 587-689 行)
   - 移动端队列 `bottom: '0'` 硬编码，未考虑 Mini Player 高度（`3.5rem`）
   - 队列可能被 Mini Player 遮挡；CSS 变量 `--queue-bottom` 只在桌面端 `@media` 中生效
4. **CSS transition 与 Framer Motion 竞争**
   - 第 179 行有 `transition-all` hover ring 效果，与 spring 动画可能冲突

**修复方向**:
- 移除 `mode="wait"`，改用 `mode="sync"` 或不用 mode（默认）让 MINI/EXPANDED 同时存在做 crossfade
- 队列浮层移动端使用 `bottom: 3.5rem`（与 Mini Player 对齐）而非 `0`
- 考虑将 `transition-all` 限制为仅 hover 需要的属性

---

## 🟡 P1 — 主页热门单曲点击名称无响应

**发现时间**: 2026-04-23

**问题描述**: 首页「热门单曲」区域中，点击歌曲名称或卡片区域没有任何反应。用户预期应跳转到单曲详情页。

**复现步骤**:
1. 访问首页 `/`
2. 在「可试听单曲」/「热门单曲」区域点击任意歌曲名称 → 无任何响应

**根因分析**:
- `app/page.tsx` 第 125-156 行：track 卡片外层 `<div>` 有 `cursor-pointer` 暗示可点击，但**没有任何 `onClick` 处理器**，也没有用 `<Link>` 包裹
- 歌曲名称 `<p>{track.titleJa}</p>` 是纯文本元素，不是链接
- 当前卡片中只有 `TrackPlayButton`（播放）和 `FavoriteButton`（收藏）可交互
- 项目中存在完整的 `/track/[id]` 详情页路由，只是未接入链接

**修复方向**:
将卡片外层 `<div>` 替换为 `<Link href={`/track/${track.id}`}>`，或保留 `<div>` 但添加 `onClick={() => router.push(...)}`。注意：播放按钮区域需要 `e.stopPropagation()` 避免与链接冲突。

---

## 修复优先级建议

| 优先级 | Bug | 理由 |
|--------|-----|------|
| P0 | 切歌不改封面/主题色 | 核心播放体验，用户感知强，修复只需 2 行代码 |
| P0 | 滑动退出异常 | 移动端致命体验问题，但修复涉及 History API 或 CSS 手势拦截，复杂度中等 |
| P1 | 动画逻辑异常 | 视觉体验问题，涉及 Framer Motion 架构调整，需仔细测试 |
| P1 | 热门单曲点击无响应 | 功能缺失，修复简单（加 Link），但非核心阻塞问题 |
