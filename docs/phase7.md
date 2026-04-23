# Phase 7 — 移动端适配（Mobile-First Responsive）

> **优先级：T0** | **目标断点：`< 768px`** | **参考：Spotify Mobile / Apple Music / Bandcamp**

---

## 一、设计原则

1. **拇指热区优先** — 所有高频操作（播放/暂停、切歌、Tab 切换）落在屏幕下半部分
2. **信息分层** — 手机一屏只展示一个核心层级，隐藏次要信息到展开态
3. **触控为王** — 按钮最小 44×44px，支持 swipe 手势，消除 hover 依赖
4. **空间换清晰度** — 字体不缩小，用更大的行高和留白替代密度
5. **暖色编辑延续** — 移动端不是"简化版桌面"，而是独立设计语言的延伸

---

## 二、断点系统

```
< 640px   → 手机（核心目标）
640-768px → 大屏手机/小平板（微调）
≥ 768px   → 桌面（现有布局，不改动）
```

Tailwind 前缀策略：
- 默认样式 = 手机布局
- `sm:` = 640px+（大屏手机微调）
- `md:` = 768px+（桌面布局，已有）

---

## 三、新增组件

### 1. BottomNav — 底部导航栏

```
位置：fixed bottom-0 left-0 right-0 z-40
高度：h-16（64px，含 safe-area-inset-bottom）
背景：var(--bg-surface) + 顶部 1px border + backdrop-blur

Tab 项（5个）：
┌────────┬────────┬────────┬────────┬────────┐
│  首页  │  专辑  │  单曲  │  艺人  │  我的  │
│ Home   │ Disc   │ Music  │ Users  │ Heart  │
└────────┴────────┴────────┴────────┴────────┘

激活态：图标 + 品牌色 + 文字
非激活态：图标 + text-tertiary
图标尺寸：24px
文字：text-micro（11px）

点击反馈：scale-95 + 背景色淡入
```

**与现有系统的关系：**
- 只在 `< md` 显示（`md:hidden`）
- 桌面端保持 Sidebar 不变
- 原汉堡菜单按钮保留，但移至 TopAppBar 右侧（作为"更多"入口）

### 2. MobileTracklist — 移动端曲目列表

替代现有 table/tracklist 在 `< md` 的展示：

```
每首曲目一张卡片：
┌────────────────────────────────────┐
│ ①  曲名（truncate）        02:34   │
│     艺人A, 艺人B...                 │
│     [▶] [♥]                        │
└────────────────────────────────────┘

卡片内边距：px-4 py-3
封面缩略图：40×40px rounded-subtle
序号：text-tertiary text-sm w-6
时长：text-tertiary text-xs
分割线：1px border-default（最后一项无）

交互：
- 整行可点击播放
- 长按/点击 ♥ 收藏
- 滑动左滑显示"添加到队列"（可选 Phase 7.2）
```

### 3. MobilePlayerSheet — 全屏播放器 Bottom Sheet

Spotify 式交互：

```
触发：点击 Mini Player 或底部导航栏上方区域
动画：从 bottom 滑入（Framer Motion y: 100% → 0%）
关闭：向下 swipe 或点击收起按钮

布局（全屏）：
┌─────────────────────────────┐
│ ───── 拖拽指示器 ─────      │  ← 8px 圆角横条，暗示可拖拽
│                             │
│    [封面大图]                 │  ← max-w-xs，aspect-square
│                             │    rounded-very，shadow-whisper
│    曲名                       │  ← text-xl font-serif
│    艺人                       │  ← text-sm text-tertiary
│                             │
│    ───── 进度条 ─────        │  ← 更粗的进度条（h-1.5）
│    00:30        02:34        │
│                             │
│    [⏮] [⏯] [⏭]            │  ← 大按钮（48px）
│                             │
│    [🔀] [🔁] [📋] [♥]       │  ← 次级控制行
│                             │
│    ───── 歌词/队列 ─────     │  ← Tab 切换（可选）
└─────────────────────────────┘

背景：var(--bg-page) + 封面主色 10% 透明度叠加（氛围色）
安全区：底部 padding-bottom: env(safe-area-inset-bottom)
```

---

## 四、组件级改动清单

### layout.tsx
- [ ] 手机端底部增加 `padding-bottom: calc(4rem + env(safe-area-inset-bottom))`
  - 为 BottomNav + Mini Player 留出空间
- [ ] 手机端主内容区 padding 从 `px-8` 改为 `px-4`
  - 所有页面统一：`px-4 sm:px-6 md:px-8`

### Sidebar.tsx
- [ ] 移除原左上角汉堡按钮（移到 TopAppBar）
- [ ] 移动端抽屉动画改为 `animate-slide-in-left`（从左侧滑入更自然）
- [ ] 抽屉宽度改为 `w-80`（略宽，提高可读性）
- [ ] 抽屉内增加底部安全区 padding

### TopAppBar.tsx
- [ ] `< md` 时显示左汉堡按钮（打开 Sidebar 抽屉）
- [ ] `< md` 时 Logo/标题居中显示（替代隐藏的 NavLinks）
- [ ] 搜索按钮在 `< md` 时全宽显示（`w-full`），placeholder 简化为"搜索..."
- [ ] `sticky top-0` 保留，但高度从 h-16 改为 `h-14`（节省垂直空间）

### BottomPlayer.tsx — 大规模重构

**MINI 模式（手机）：**
- [ ] 高度从 h-16 改为 `h-14`
- [ ] 移除 `md:left-64`（全宽）
- [ ] 恢复 `SkipBack` / `SkipForward` 按钮（移除 `hidden sm:block`）
- [ ] 恢复 `Play/Pause` 按钮（当前已显示，保持）
- [ ] 曲目信息区域增大（歌手名换行显示，不 truncate）
- [ ] 移除进度条（手机 Mini 不显示进度条，移到 Expanded）
- [ ] 右侧增加展开按钮（`Maximize2`，点击打开 MobilePlayerSheet）
- [ ] 底部增加 safe-area-inset-bottom

**EXPANDED 模式（手机）：**
- [ ] 改为全屏 Bottom Sheet（非居中弹窗）
- [ ] 使用 `layoutId="player-cover"` 从 Mini 封面放大到中央大图
- [ ] 背景使用封面主色的 8% 透明度（氛围色）
- [ ] 进度条加粗（`h-1.5`），支持触摸拖拽
- [ ] 控制按钮加大（`w-14 h-14`）
- [ ] 增加 swipe down 关闭手势
- [ ] 底部安全区处理

**队列浮层（手机）：**
- [ ] 改为从底部滑出的半屏 Sheet（非居中弹窗）
- [ ] 高度：max-h-[60vh]
- [ ] 支持 swipe down 关闭

### ReleaseList.tsx
- [ ] 手机端视图切换默认 `grid`（2列），隐藏 `table` 按钮
- [ ] Grid 视图：`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5`
- [ ] 筛选控件垂直堆叠：`flex-col md:flex-row`
- [ ] 搜索框全宽：`w-full md:max-w-md`
- [ ] 类型筛选按钮横向滚动：`overflow-x-auto whitespace-nowrap`

### TrackListClient.tsx
- [ ] 同 ReleaseList：默认 grid（2列），筛选控件垂直堆叠
- [ ] 可试听按钮保持横向排列

### page.tsx（首页）
- [ ] Hero 标题字号缩小：`text-3xl sm:text-4xl md:text-display`
- [ ] 按钮改为垂直堆叠：`flex-col sm:flex-row`
- [ ] 统计卡片：`grid-cols-2`（已有，保持）
- [ ] 最新发行网格：`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- [ ] 热门单曲：横向滚动卡片（`overflow-x-auto flex gap-4`）

### release/[id]/page.tsx
- [ ] Hero：垂直布局（封面在上，信息在下）
- [ ] 封面尺寸：`w-full max-w-xs mx-auto`
- [ ] Meta 信息改为垂直列表（非 grid）
- [ ] Tracklist：使用 MobileTracklist 组件（`< md`）
- [ ] 相似推荐：`grid-cols-2 sm:grid-cols-4`

### track/[id]/page.tsx
- [ ] Hero：垂直布局（封面在上，信息在下）
- [ ] Credits：垂直列表（非 grid）
- [ ] 相似曲目：`grid-cols-2 sm:grid-cols-3`

### artists/ArtistGrid.tsx
- [ ] 角色筛选：横向滚动 `overflow-x-auto`
- [ ] 网格：`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- [ ] 艺人卡片缩小内边距和头像尺寸

### search/SearchClient.tsx
- [ ] 搜索框全宽，增加搜索图标尺寸
- [ ] Tab 切换改为横向滚动（如果空间不足）
- [ ] 结果列表使用卡片布局（替代密集列表）

### favorites/page.tsx
- [ ] 使用与 tracks 相同的 MobileTracklist
- [ ] 空状态居中显示

### explore/map/GenreMapClient.tsx
- [ ] 图表容器全宽，高度降低到 `h-[50vh]`
- [ ] Tooltip 放大字体
- [ ] 底部图例改为横向滚动

---

## 五、CSS 变量与工具类补充

### globals.css 新增

```css
/* 安全区适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 移动端抽屉动画 */
@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 禁止文本选择（提升触摸体验） */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

/* 触摸高亮去除 */
.touch-highlight-none {
  -webkit-tap-highlight-color: transparent;
}
```

### tailwind.config.js 补充

```js
extend: {
  spacing: {
    'safe-bottom': 'env(safe-area-inset-bottom)',
  },
  height: {
    'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
  },
}
```

---

## 六、实施顺序

### Sprint 1：布局骨架（高影响，低风险）
1. **layout.tsx** — 手机 padding + 底部安全区
2. **BottomNav** — 新建组件，5 个 Tab 路由
3. **TopAppBar** — 手机高度 + 汉堡按钮位置
4. **Sidebar** — 移除左上角汉堡，优化抽屉动画

### Sprint 2：播放器重构（高影响，中风险）
5. **BottomPlayer MINI** — 恢复控制按钮，调整高度
6. **MobilePlayerSheet** — 新建全屏播放器
7. **队列浮层** — 改为半屏 Sheet

### Sprint 3：列表/网格适配（中影响，低风险）
8. **ReleaseList / TrackListClient** — 手机默认 grid，隐藏 table
9. **MobileTracklist** — 新建组件，替换 tracklist
10. **首页 / 搜索 / 艺人页** — 调整网格和 padding

### Sprint 4：详情页适配（中影响，低风险）
11. **release/[id]** — 垂直 Hero + MobileTracklist
12. **track/[id]** — 垂直 Hero + 相似曲目网格
13. **artist/[id]** — 统计 + 作品列表

### Sprint 5：打磨（低影响，低风险）
14. **手势支持** — swipe 展开/收起播放器，swipe 切歌
15. **暗色模式移动端** — 验证所有组件
16. **性能优化** — 减少重渲染，图片懒加载

---

## 七、验收标准

### 功能性
- [ ] iPhone SE（375×667）上所有页面可正常浏览
- [ ] iPhone 14 Pro（393×852）上播放器展开/收起流畅
- [ ] Android Chrome 上无水平滚动条（除非设计意图）
- [ ] 所有按钮/链接最小可点击区域 ≥ 44×44px

### 体验性
- [ ] 从首页到播放一首曲目 ≤ 3 次点击
- [ ] 播放/暂停、切歌、收藏可在拇指范围内操作
- [ ] 页面切换无布局偏移（CLS < 0.1）

### 视觉
- [ ] 暖色编辑风格在手机上一致呈现
- [ ] 字体可读性良好（最小 14px，行高 ≥ 1.5）
- [ ] 暗色模式下无突兀的亮色区块

---

## 八、参考案例

| 产品 | 值得学习的点 |
|------|-------------|
| **Spotify Mobile** | Bottom Nav + Mini Player + 全屏展开手势 |
| **Apple Music** | 大封面 + 氛围色背景 + 简洁控制布局 |
| **Bandcamp** | 信息密度控制 + 专辑卡片网格 |
| **网易云音乐** | 底部导航 + 横向滚动歌单 + 歌词全屏 |

---

*创建日期: 2026-04-23*
*负责人: AI Agent*
*预期工期: 5 Sprints（约 2-3 次对话周期）*
