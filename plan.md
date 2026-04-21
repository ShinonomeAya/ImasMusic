你将帮我分三阶段构建《偶像大师》系列音乐数据库 Web 项目。每阶段完成后等待我确认再继续。

═══════════════════════════
阶段一：数据层（先不写任何 UI 代码）
═══════════════════════════

【1.1】输出以下 TypeScript 定义文件内容：

// types/song.ts
interface Idol { id: string; nameJa: string; nameZh: string }
interface Release { album: string; year: number; type: "single"|"album"|"game"|"dlc" }

interface Song {
  id: string                    // 格式：{series}-{4位序号}
  titleJa: string
  titleZh: string
  titleRomaji: string
  series: "765"|"cinderella"|"million"|"shinycolors"|"sidem"
  idols: Idol[]
  unit: string | null
  isCover: boolean              // 是否翻唱曲
  originalArtist: string | null // 翻唱原唱，原创则为 null
  releases: Release[]
  firstYear: number             // 从 releases 自动推导
  composer: string
  lyricist: string
  arranger: string
  primaryGenre: PrimaryGenre
  subGenres: SubGenre[]
  usage: "character"|"unit"|"event"|"theme"|"ingame"|"cover"
  idolAttribute: "cute"|"cool"|"passion"|null
  energy: number                // 0–10，歌曲能量强度
  valence: number               // 0–10，情绪正负（0=忧郁，10=明朗）
  hasLiveVersion: boolean
  crossSeriesIds: string[]      // 跨系列收录时的关联 id
  externalLinks: { youtube?: string; niconico?: string; spotify?: string }
  tags: string[]                // 自由标签
}

【1.2】输出 genres.config.ts，包含 9 个 primaryGenre 枚举值，每个字段：
- key（英文标识）
- nameZh（中文显示名）
- description（2 句话定义 + 与相邻风格的边界说明）
- color（用于 UI 区分的色值，每个风格一个独特色）
- representativeSongs（代表曲 3 首，格式：曲名(系列)）

9 个枚举：idol-pop / mature-pop / rock-energy / electronic / jazz-soul / classical / wafuu / stage-drama / ambient-ballad

【1.3】输出示例数据，文件 /data/765/sample.ts 和 /data/shinycolors/sample.ts，
每个系列各 6 首曲目，要求：
- 覆盖不同 primaryGenre（不要全部选 idol-pop）
- 至少包含 1 首翻唱曲（isCover: true）
- energy 和 valence 值要有合理差异（不要全填 5）
- 数据来源注释：// source: project-imas.wiki

═══════════════════════════
阶段二：核心页面
═══════════════════════════

技术栈：Next.js 14 App Router + TypeScript + Tailwind CSS + Recharts + Fuse.js
每个路由目录必须包含：page.tsx · loading.tsx · error.tsx

【2.1】项目文件结构（先只输出目录树，不写代码）

【2.2】依次实现以下页面，每个页面完成后停下来等我确认：

页面 A：/ 首页
- 各系列入口卡片（系列名、曲目数量、风格构成 mini 条形图、代表色）
- 全站风格分布甜甜圈图（Recharts，颜色来自 genres.config.ts）
- 风格标签云（标签大小=曲目数量占比，可点击跳转 /genre/[slug]）
- 随机发现按钮（随机跳转 /song/[id]）

页面 B：/series/[id]
- 系列简介（从 series.config.ts 读取）
- 风格构成水平条形图（按 primaryGenre 分段，颜色来自 genres.config.ts）
- 曲目列表按 primaryGenre 分组，每组可折叠
- 列表/网格视图切换（偏好存 localStorage）

页面 C：/genre/[slug]
- 风格定义卡片（来自 genres.config.ts 的 description）
- 曲目列表，系列来源用色块标记
- 右侧数据：该风格在各系列的占比 + 最活跃编曲人 Top 3

页面 D：/song/[id]
- 完整字段展示（翻唱曲显示原唱来源 + 链接）
- 版本列表（来自 releases 数组，按年份排序）
- 相似推荐：同 primaryGenre + 相近 energy/valence 的 6 首
- 外部链接区（YouTube/NicoNico/Spotify 图标按钮）

页面 E：/search
- Fuse.js 搜索（索引字段：titleJa + titleRomaji + titleZh + idols.nameJa）
- 筛选栏：series × primaryGenre × firstYear 范围 × usage × isCover
- 筛选条件显示为可删除 chip
- 结果支持列表/网格切换 + 排序（年份/字母/energy）

═══════════════════════════
阶段三：特色页面
═══════════════════════════

页面 F：/map 风格地图
- Recharts ScatterChart
- X 轴 = energy（0–10），Y 轴 = valence（0–10）
- 每个气泡代表一首曲目，颜色=系列，大小统一
- hover tooltip 显示：曲名 + 演唱者 + primaryGenre
- 左侧可按系列/风格过滤显示的气泡

页面 G：/timeline 时间线
- Recharts AreaChart，堆叠面积
- X 轴=年份，Y 轴=该年各风格曲目数量
- 顶部可切换：全系列合并 / 单一系列

页面 H：/compare 系列对比
- 选择两个子系列（Select 组件）
- Recharts RadarChart，两个系列的风格比例叠加显示
- 下方文字：列出各自独有风格及曲目数量

页面 I：/idol/[id]
- 偶像基本信息（从 idols.config.ts 读取）
- 全部曲目列表（含跨系列曲目）
- 个人风格饼图 + 合作编曲人列表（按合作次数排序）

页面 J：/arranger/[id]
- 编曲人所有作品列表（跨系列）
- 风格偏好统计条形图
- 按系列分组的作品数量对比

═══════════════════════════
通用规范（所有页面适用）
═══════════════════════════
- 深色/浅色模式跟随系统（Tailwind dark: 类）
- 所有图表颜色从 genres.config.ts 或 series.config.ts 统一读取，组件内不硬编码色值
- 日文曲名作为页面 og:title，中文译名作为 description
- 图表加载中显示 skeleton，加载失败显示 error.tsx
- 移动端：卡片单列，图表可横向滚动
- 搜索/筛选偏好存 localStorage（key 前缀：imas-db-）
- /favorites 页：localStorage 收藏列表，支持导出为纯文本格式

════════════════════════════
设计系统补充：曲风主题化界面
════════════════════════════

【设计原则】
**重要：在生成所有 UI 组件前，必须先读取 /docs/DESIGN-claude.md 中的设计规范
作为基础样式准则（间距、字号、组件样式）。**

曲风界面采用"适度主题化"方案：
- /styles/genre-themes.css 中的 CSS 变量只覆盖色彩和装饰层
- 不覆盖 DESIGN-claude.md 中定义的核心间距、字号和布局规范
- 职责边界：DESIGN-claude.md 管"结构"，genre-themes 管"气质"

【需要创建的文件】

1. /styles/genre-themes.css
   定义 9 套风格主题的 CSS 变量，每套包含：
   - --genre-primary      主色
   - --genre-primary-dark 主色深色模式
   - --genre-secondary    辅色
   - --genre-bg           页面底色（淡，保证可读性）
   - --genre-bg-dark      底色深色模式
   - --genre-surface      卡片表面色
   - --genre-border       边框色
   - --genre-text-on-primary 主色上的文字色
   - --genre-font-display  标题字体（部分风格用衬线体）
   - --genre-radius        圆角大小（摇滚系更小/方正，流行系更大/圆润）

   以 data-genre 属性选择器应用：
   [data-genre="idol-pop"] { --genre-primary: #FF6B9D; ... }
   [data-genre="rock-energy"] { --genre-primary: #E53E3E; ... }
   等

2. /components/GenreDecorator.tsx
   每个风格页面的装饰背景组件，通过 SVG/CSS 实现，
   以 position: absolute 覆盖在页面背景层，z-index: 0，
   内容层 z-index: 1 覆盖其上。

   【装饰生成顺序（重要）】
   -- 第一批：先生成高难度 SVG 装饰，确认效果后再继续 --
   - classical：细线五线谱纹 SVG（需手写 SVG path，金/米白色调）
   - wafuu：青海波 SVG 纹样（需手写 SVG，朱红/靛蓝调）

   【停下来确认】wafuu 和 classical 的装饰效果满意后，再继续生成其余 7 种：
   - idol-pop：彩色圆形/星形几何，低透明度
   - mature-pop：细线菱形网格，低透明度
   - rock-energy：锯齿/对角线纹理，高对比度
   - electronic：扫描线 + 网格，绿/青色调
   - jazz-soul：复古点阵纹理，暖褐色调
   - stage-drama：放射状聚光灯，金/深红调
   - ambient-ballad：柔和渐变晕染，纯色调

3. /components/GenrePageWrapper.tsx
   风格页面的外层容器，接收 genreSlug prop，
   自动设置 data-genre 属性和应用 GenreDecorator，
   所有 /genre/[slug] 页面统一使用此组件包裹。

【9 种风格的色彩方案参考】

idol-pop：
  主色 #FF6B9D（粉红）/ 辅色 #FFE0EE / 字体 圆体/无衬线
  暗色：主色 #FF8FB3 / 背景 #1a0a0f
  装饰：低透明度彩色圆形，圆角大（20px+）

mature-pop：
  主色 #7C5CBF（紫）/ 辅色 #EDE9F7 / 字体 无衬线细体
  暗色：主色 #A585E0 / 背景 #0f0a1a
  装饰：细线菱形网格

rock-energy：
  主色 #E53E3E（红）/ 辅色 #FFF0F0 / 字体 无衬线粗体
  暗色：主色 #FC8181 / 背景 #1a0505
  圆角小（4px），边框加粗（2px），装饰：对角锯齿纹

electronic：
  主色 #00D4AA（青绿）/ 辅色 #E0FFF8 / 字体 等宽字体混排标题
  暗色：主色 #00FFCC / 背景 #030f0e
  装饰：扫描线 + 点阵网格，霓虹感边框

jazz-soul：
  主色 #C8860A（琥珀）/ 辅色 #FDF4E3 / 字体 衬线体标题
  暗色：主色 #F0A832 / 背景 #120c00
  装饰：复古点阵纹，圆角中等（8px）

classical：
  主色 #8B6914（金）/ 辅色 #FAF6EC / 字体 衬线体（全站最正式）
  暗色：主色 #D4AF37 / 背景 #0d0a00
  装饰：细线五线谱纹，边框用细双线

wafuu：
  主色 #C0392B（朱红）/ 辅色 #FFF5F5 / 字体 无衬线（考虑日文字形）
  暗色：主色 #E57373 / 背景 #140505
  装饰：青海波 SVG 纹样（提供 SVG 代码）

stage-drama：
  主色 #B7860B（舞台金）/ 辅色 #2C0E0E（幕布红）/ 字体 衬线体
  暗色：主色 #FFD700 / 背景 #0a0000
  装饰：放射状聚光灯 + 金色水平线

ambient-ballad：
  主色 #5B8DBE（雾蓝）/ 辅色 #EFF5FB / 字体 无衬线细体
  暗色：主色 #90B8D8 / 背景 #050a0f
  装饰：柔和渐变晕染（CSS radial-gradient），无硬边

【关于 awesome-design-md 集成】
在生成每个 GenrePageWrapper 时，
从 /docs/awesome-design.md 读取基础设计规范（间距、字号、组件样式），
genre-themes.css 中的变量只覆盖色彩和装饰层，
不覆盖 awesome-design.md 中定义的核心布局规范。
这样可以保证各风格页面的整体一致性，只有"气质"不同。