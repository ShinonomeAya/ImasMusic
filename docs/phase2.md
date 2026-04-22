# Phase 2: 数据层重构与脚手架 (Data Layer & Scaffolding)

> 状态: ✅ COMPLETED
> 完成时间: 2026-04-22
> 目标: 统一数据模型，搭建自动化数据导入脚手架

---

## 任务清单

### 1. API 封装
- [x] `lib/api/itunes.ts` — iTunes Search API 完整封装
  - `searchItunes()` 搜索函数（支持 song/album/artist）
  - `pickBestMatch()` 智能匹配最佳结果
  - `getHighResArtwork()` 高清封面 URL 生成
  - `itunesResultToPartialTrack()` / `itunesResultToPartialRelease()` 数据转换
- [x] `lib/api/audio.ts` — 音频工具
  - `validatePreviewUrl()` 试听链接验证
  - `getDurationFromMillis()` 时长转换
  - `parseReleaseYear()` 年份解析

### 2. 数据导入脚手架 (CLI)
- [x] `scripts/seed-cli.ts` — Node.js CLI 脚本
  - 参数解析: --input, --series, --type, --output, --delay, --limit
  - 逐行处理输入文件，调用 iTunes API
  - 智能匹配 + 错误收集
  - Rate limit 保护（默认 1500ms 间隔）
  - 输出: `{series}_{type}s_{date}_tracks.json` / `_releases.json` / `_errors.json`
- [x] 示例输入文件: `data/seed/input/765-sample.txt`

### 3. 数据文件结构
- [x] `data/tracks.json` — 曲目数据（空，待脚手架填充）
- [x] `data/releases.json` — 发行物数据（空，待脚手架填充）
- [x] `data/artists.json` — 艺人数据（空，待脚手架填充）
- [x] `data/seed/input/` — 输入目录
- [x] `data/seed/output/` — 输出目录

### 4. 统一数据查询层
- [x] `lib/data.ts` — 完全重写
  - 异步加载 JSON 数据（带缓存）
  - Track 查询: byId, byRelease, byArtist, bySeries, search
  - Release 查询: byId, bySeries, byType, search
  - Artist 查询: byId, byRole, bySeries
  - 统计: `getSeriesStats()` — 按类型/年份/BPM 范围统计
  - 可视化数据: `getTracksWithAudioFeatures()` — 用于曲风地图

### 5. 旧页面处理
- [x] 将原有旧页面归档至 `app/_archive/`（保留代码参考）
- [x] 更新 `tsconfig.json` 排除 `app/_archive`
- [x] 清理 `.next/` 和 `.build/` 缓存

### 6. 构建验证
- [x] `npm run type-check` — 零错误通过
- [x] `npm run build` — 生产构建成功

---

## 搁置项 (⏸️)

| 功能 | 原因 | 激活条件 |
|---|---|---|
| Spotify Web API 封装 (`lib/api/spotify.ts`) | 缺少 Client ID/Secret | 用户提供凭证后激活 |
| audio-features 抓取 (energy/valence/BPM/key/mode) | 依赖 Spotify API | 同上 |
| `.env.local` 配置 | 同上 | 同上 |

---

## 脚手架使用指南

```bash
# 1. 准备曲目列表 (每行一个查询词)
# data/seed/input/765-sample.txt

# 2. 运行脚手架
npx tsx scripts/seed-cli.ts \
  --input data/seed/input/765-sample.txt \
  --series 765 \
  --type track \
  --output data/seed/output/

# 3. 检查输出
# data/seed/output/765_tracks_2026-04-22_tracks.json
# data/seed/output/765_tracks_2026-04-22_releases.json
# data/seed/output/765_tracks_2026-04-22_errors.json

# 4. 将生成的数据复制到 data/ 目录即可被应用加载
```

---

## 下一阶段入口

→ [docs/phase3.md](./phase3.md) （待创建）
