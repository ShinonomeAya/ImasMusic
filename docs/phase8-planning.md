# Phase 8 规划书 — 自动化数据丰满与架构升级

> **版本**: v1.2  
> **日期**: 2026-04-27  
> **状态**: 🚧 准备中  
> **前置条件**: Phase 7（移动端体验）已全部完成并通过 13 项 E2E 测试

---

## 0. 战略愿景：告别手动录入，全面走向 API 自动化流水线

当前项目拥有 **3,403 tracks + 734 releases + 344 artists**，核心痛点如下：

| 数据维度 | 当前状态 | 痛点 |
|---|---|---|
| Track Credits（作词/作曲/编曲） | 几乎全部为空 `[]` | 3,403 首歌曲纯人工录入不现实 |
| Track 歌词 | 0/3,403 | 全部缺失 |
| Release Catalog Number | 几乎全部缺失 | 无法精准关联外部数据库 |
| Release Label | 几乎全部缺失 | 缺少唱片公司维度 |
| Artist Portrait | 全部缺失 | 艺人页面只有文字 |
| Artist 代表色 | 仅 imasparql 原始值，未 Hex 标准化 | 无法用于 UI 着色 |

**决策确认（2026-04-27）**：
- ✅ **Credits（作词/作曲/编曲）** 为核心目标，保留 VGMdb 补充
- ✅ **歌词** 为核心目标，与 Credits 并行推进
- ✅ **Catalog Number / Label** 为核心目标
- ❌ **BPM / 乐评 / 分析内容** 取消
- ❌ **Spotify 声学特征** 降级为远期储备（Phase 9 候选）

---

## 1. 核心数据架构战略：三位一体融合

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Phase 8 数据融合架构                          │
├─────────────────────────────────────────────────────────────────────┤
│  表现层 (Frontend)                                                   │
│  ├── Next.js 静态导出 → `dist/` (4,498+ pages)                       │
│  └── 只读取 `data/*.json`，零运行时 API 调用                          │
├─────────────────────────────────────────────────────────────────────┤
│  融合层 (Local Scripts)  ← 你在这里                                  │
│  ├── `scripts/pipeline-musicbrainz.ts`   MusicBrainz 元数据抓取        │
│  ├── `scripts/pipeline-vgmdb.ts`         VGMdb Credits 补充            │
│  ├── `scripts/pipeline-lyrics-moegirl.ts` 萌娘百科歌词批量抓取         │
│  ├── `scripts/pipeline-lyrics-wiki.ts`   Project iM@S Wiki 歌词提取    │
│  ├── `scripts/pipeline-imasparql-v2.ts`  偶像关系图谱 + 头像 + 代表色   │
│  └── `scripts/pipeline-merge.ts`         多源数据融合与冲突解决        │
├─────────────────────────────────────────────────────────────────────┤
│  数据源层 (External APIs / Web Scraping)                             │
│  ├── iTunes API        → 封面、30s 试听、基础发行信息 (已有)           │
│  ├── MusicBrainz API   → Credits、Catalog、Label、精确发行日期         │
│  ├── VGMdb             → 日本动画/游戏音乐 Credits 补充（Arranger）     │
│  ├── imasparql         → Idol↔CV↔Unit 关系、代表色                    │
│  ├── 萌娘百科           → 中文歌词                                    │
│  ├── Project iM@S Wiki → 英文/日文歌词、角色立绘                       │
│  └── Wikidata API      → CV 真人照片 (fallback)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.1 基础层：iTunes API（已有，持续维护）

**职责**: 提供高分辨率专辑封面 (`coverUrl`) 和 30 秒音频试听 (`previewUrl`)。

**已有能力**:
- `lib/api/itunes.ts` — 搜索、封面尺寸转换、最佳匹配选择
- `scripts/seed-cli.ts` — 单曲/专辑导入 CLI
- `scripts/batch-fetch-albums.ts` — 6 企划批量专辑抓取

**Phase 8 增强**:
- 在 `seed-cli.ts` 中预留 `catalogNumber` 字段，供后续 MusicBrainz 回填
- 将 iTunes `collectionId` 作为 MusicBrainz 检索的辅助键之一

### 1.2 深度元数据层：MusicBrainz + VGMdb + 歌词源

#### MusicBrainz — Credits + Catalog + Label

MusicBrainz 是全球最大的开源音乐元数据库，JSON API，Rate Limit **1 req/sec**。

**两级抓取策略（用户确认：先 Release-level 打底，再 Recording-level 精修）**：

**第一级：Release-level 批量打底**
- 对每个 Release，用 `catalogNumber` 或 `"${release.titleJa}"` 搜索 MusicBrainz Release
- 获取该 Release 下的 `artist-relation-list`（通常在 Release 级别包含 Credits）
- 将 Credits 按 `track-count` 均摊到该 Release 的全部 tracks
- 覆盖预估：**60%+**（大部分偶像大师专辑在 MusicBrainz 上有 Release 记录）

**第二级：Recording-level 精修**
- 对第一级未覆盖或 confidence 为 low 的 track，用 `"${track.titleJa} ${release.titleJa}"` 搜索 Recording
- 获取 `recording` 级别的 `artist-relation-list`（精确的 per-track Credits）
- 按 `trackNumber` 对齐，验证匹配
- 覆盖预估：在 Release-level 基础上再提升 **15–20%**

#### VGMdb — Credits 补充（Arranger 专长）

VGMdb 在日本游戏/动画音乐的 **Arranger（编曲）** 数据上比 MusicBrainz 更完整。

**触发条件**：仅在 MusicBrainz 返回的 Credits 缺少 `ARRANGER` 时查询 VGMdb。

#### 歌词数据源（三层互补）

| 优先级 | 来源 | 语言 | 覆盖预估 | 技术方案 |
|---|---|---|---|---|
| P1 | Project iM@S Wiki | 英文/日文 | 20–30% | 扩展 `parse-wiki-dump.ts` 提取 `Lyrics` 段落 |
| P2 | 萌娘百科 | 中文 | 30–40% | Playwright 批量抓取 |
| P3 | Uta-Net | 日文 | 50–60% | HTML 解析（后续调研） |

**融合策略**：多源并存，以 track 为单位保留各语言版本，标记 `lyricsLang` 和 `lyricsSource`。

### 1.3 企划语义层：imasparql v2（深化）

**验证结果速查**：

| 目标 | imasparql 验证结果 | 结论 |
|---|---|---|
| **Idol ↔ CV 双向关联** | 256/353 偶像有 CV (72.5%)。CV 值混存 URI (Wikidata/DBpedia) + Literal (纯文本名字)。CV URI 是外部链接，imasparql 中**没有 CV 实体的任何属性** | ⚠️ 部分可用。Literal 名字可直接用；Wikidata QID 存为 `cvWikidataId` |
| **Unit ↔ member 关系** | 100% 覆盖 (344 idols, 1,528 units)。双向完整 | ✅ 完全可用 |
| **角色立绘/头像 URL** | `schema:image` = **0/353**。完全不可用 | ❌ 必须从 Project iM@S Wiki / Wikidata 外部获取 |
| **代表色 Hex 标准化** | 242/353 有 `imas:Color` (68.5%)。格式为纯 6 位 Hex | ✅ 完全可用，只需加 `#` 前缀 |

**头像双源策略（用户确认：两个都要，角色立绘优先）**：
1. **Primary**：Project iM@S Wiki 角色立绘（覆盖 80–90%，粉丝体验更佳）
2. **Secondary**：Wikidata API CV 真人照片（覆盖 50–70%，fallback）

---

## 2. Phase 8.1 — 自动化数据流水线 (Data Pipeline)

### 2.1 新脚本体系

```
scripts/
├── pipeline/
│   ├── musicbrainz.ts      # MusicBrainz API 客户端（Release-level + Recording-level）
│   ├── vgmdb.ts            # VGMdb 数据抓取与解析
│   ├── lyrics-wiki.ts      # Project iM@S Wiki 歌词提取
│   ├── lyrics-moegirl.ts   # 萌娘百科歌词批量抓取
│   ├── imasparql-v2.ts     # 深化版偶像关系图谱 + 头像 + 代表色
│   └── merge-engine.ts     # 多源数据融合引擎
├── pipeline-musicbrainz.ts # 主入口：MusicBrainz 两级流水线
├── pipeline-vgmdb.ts       # 主入口：VGMdb Credits 补充流水线
├── pipeline-lyrics-wiki.ts # 主入口：Wiki 歌词提取
├── pipeline-lyrics-moegirl.ts # 主入口：萌娘百科歌词抓取
├── pipeline-imasparql-v2.ts# 主入口：艺人数据深化流水线
└── pipeline-merge.ts       # 主入口：最终合并与输出
```

### 2.2 MusicBrainz 流水线（两级策略）

#### 2.2.1 API 客户端 (`scripts/pipeline/musicbrainz.ts`)

```typescript
const MB_BASE = 'https://musicbrainz.org/ws/2'
const USER_AGENT = 'iM@S-Archive/0.4.0 (https://master.imas-music.pages.dev/)'

interface MBRelease {
  id: string
  title: string
  'artist-credit': { name: string }[]
  date?: string
  'label-info'?: { label: { name: string }; 'catalog-number'?: string }[]
  'release-events'?: { date: string }[]
  'track-count': number
  'artist-relation-list'?: {
    type: 'composer' | 'lyricist' | 'arranger' | 'vocal'
    artist: { id: string; name: string }
  }[]
}

interface MBRecording {
  id: string
  title: string
  'artist-relation-list'?: {
    type: 'composer' | 'lyricist' | 'arranger' | 'vocal'
    artist: { id: string; name: string }
  }[]
}

// Release-level 搜索（第一级）
export async function searchRelease(
  query: string,
  catalogNumber?: string
): Promise<MBRelease[]>

// Recording-level 搜索（第二级）
export async function searchRecording(
  query: string
): Promise<MBRecording[]>

// 获取 Release 详情（含 tracks + credits）
export async function getReleaseWithTracks(
  releaseId: string
): Promise<MBRelease>
```

**Rate Limiting**：`p-throttle` 限制 1 req/sec + `p-retry` 指数退避。

#### 2.2.2 第一级：Release-level 批量打底 (`pipeline-musicbrainz.ts --level=release`)

**工作流**：
1. 读取 `data/releases.json`
2. 对每个 Release，优先用 `catalogNumber` 搜索，fallback 到 `titleJa`
3. 获取匹配的 MusicBrainz Release
4. 提取 Release 级别的 `artist-relation-list` → Credits
5. 提取 `label-info` → Label + Catalog Number
6. 将 Credits 按 `track-count` 均摊到该 Release 的全部 tracks

**输出**：`data/seed/output/mb_release_patches_{timestamp}.json`

```typescript
interface MBReleasePatch {
  releaseId: string
  mbReleaseId: string
  confidence: 'high' | 'medium' | 'low'
  // Release 级别元数据
  catalogNumber?: string
  label?: string
  releaseDate?: string
  // Credits（均摊到该 Release 全部 tracks）
  credits: Array<{
    name: string
    role: 'LYRICIST' | 'COMPOSER' | 'ARRANGER' | 'VOCALS'
    mbArtistId: string
  }>
}
```

**匹配置信度**：
- `high`：catalogNumber 精确匹配
- `medium`：title 匹配 + track-count 一致
- `low`：title 模糊匹配，跳过不写

#### 2.2.3 第二级：Recording-level 精修 (`pipeline-musicbrainz.ts --level=recording`)

**工作流**：
1. 读取第一级输出，筛选 `confidence !== 'high'` 或 credits 为空的 tracks
2. 对每个 track，用 `"${track.titleJa} ${release.titleJa}"` 搜索 Recording
3. 获取 Recording 级别的 `artist-relation-list`
4. 按 `trackNumber` 对齐验证

**输出**：`data/seed/output/mb_recording_patches_{timestamp}.json`

#### 2.2.4 VGMdb 补充流水线

**触发条件**：MusicBrainz 返回的 Credits 缺少 `ARRANGER`。

**技术方案**：HTML 解析（`cheerio`）。检索 URL + Album 页面解析。请求延迟 3–5s。

```typescript
interface VGMdbPatch {
  trackId: string
  releaseId: string
  credits: Array<{ name: string; role: 'ARRANGER' | 'LYRICIST' | 'COMPOSER' }>
  source: 'vgmdb'
}
```

### 2.3 歌词流水线设计

#### 2.3.1 萌娘百科歌词批量抓取

**工作流**：
1. 遍历 `data/tracks.json`，筛选缺少 `lyricsZh` 的曲目
2. 用 `"${track.titleJa} 偶像大师"` 搜索萌娘百科
3. Playwright 访问结果页面，提取歌词区域（`<poem>` 或 lyrics class）
4. 输出 `data/seed/output/lyrics_moegirl_{timestamp}.json`

**Rate Limiting**：3–5s 间隔 + 随机 User-Agent。

#### 2.3.2 Project iM@S Wiki 歌词提取

**工作流**：
1. 读取 `data/seed/wiki-dumps/*.txt`（用户手动保存的 Wiki 页面）
2. 扩展 `parse-wiki-dump.ts`，识别 `<tabber>` 内的 `Lyrics` 段落
3. 提取日文/英文/罗马音版本
4. 按曲目名匹配到 tracks.json

**注意**：`data/seed/wiki-dumps/` 当前为空，需要用户逐步积累。

#### 2.3.3 歌词合并策略

```typescript
interface LyricsPatch {
  trackId: string
  lyricsJa?: string
  lyricsZh?: string
  lyricsEn?: string
  lyricsRomaji?: string
  source: 'wiki' | 'moegirl' | 'utanet'
  confidence: 'high' | 'medium' | 'low'
}

function mergeLyrics(
  existing: Track,
  patches: LyricsPatch[]
): Partial<Track> {
  // 1. existing 已有某语言歌词 → 保留（人工优先）
  // 2. 多个 patch 提供同一语言 → 选字数最多的
  // 3. 标记 source 和 confidence
}
```

### 2.4 流水线执行顺序

```
并行组 A（Credits）:
  Step A1: pipeline-musicbrainz.ts --level=release
           └── 输入: data/releases.json
           └── 输出: mb_release_patches_*.json
           └── 耗时: ~20 min

  Step A2: pipeline-musicbrainz.ts --level=recording
           └── 输入: data/tracks.json, mb_release_patches
           └── 输出: mb_recording_patches_*.json
           └── 耗时: ~30 min

  Step A3: pipeline-vgmdb.ts
           └── 输入: mb_release_patches + mb_recording_patches
           └── 输出: vgm_patches_*.json
           └── 耗时: ~20 min

并行组 B（歌词）:
  Step B1: pipeline-lyrics-moegirl.ts
           └── 输入: data/tracks.json
           └── 输出: lyrics_moegirl_*.json
           └── 耗时: ~2h（3,403 tracks × 4s 间隔）

  Step B2: pipeline-lyrics-wiki.ts
           └── 输入: data/seed/wiki-dumps/
           └── 输出: lyrics_wiki_*.json
           └── 耗时: 取决于 dump 文件数量

最终合并:
  Step C: pipeline-merge.ts
          └── 输入: tracks.json, releases.json, 全部 patches
          └── 逻辑: smart merge + conflict 标记
          └── 输出: tracks.json / releases.json（更新）
          └── 备份: *.json.bak.{timestamp}
```

---

## 3. Phase 8.2 — 艺人与企划数据深化 (Artist Domain)

### 3.1 imasparql v2 深化脚本

#### A. CV ↔ Idol 双向关联

**验证结果**：256/353 偶像有 CV (72.5%)。CV 值格式：URI (Wikidata/DBpedia) + Literal (纯文本名字)。

抓取后建立：
- Idol 的 `cvId` 字段 → CV 的 Artist ID（Literal 名字）
- Idol 的 `cvWikidataId` 字段 → Wikidata QID
- CV 的 `characterIds` 字段 → 配音的角色 ID 列表
- 97 位无 CV 的偶像标记为 `cvId: null`

#### B. Unit 成员关系

**验证结果**：100% 覆盖。抓取 `unitIds`（Idol → Unit）和 `memberIds`（Unit → member）。

#### C. 头像双源抓取（用户确认：角色立绘优先 + CV 照片 fallback）

**Primary：Project iM@S Wiki 角色立绘**
```typescript
async function fetchPortraitFromWiki(characterName: string): Promise<string | undefined> {
  const url = `https://project-imas.wiki/${encodeURIComponent(characterName.replace(/\s+/g, '_'))}`
  // Playwright / cheerio 解析 info-box 图片
}
```
- 覆盖预估：80–90%

**Secondary：Wikidata API CV 真人照片**
```typescript
async function fetchPortraitFromWikidata(wikidataId: string): Promise<string | undefined> {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
  // 查询 P18 (image) → Wikimedia Commons URL
}
```
- 覆盖预估：50–70%

**合并**：`portraitUrl = wikiPortrait || wikidataPortrait || undefined`

#### D. 代表色 Hex 标准化

**验证结果**：242/353 有 `imas:Color` (68.5%)，格式为纯 6 位 Hex。

```typescript
function normalizeColor(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const hex = raw.trim().replace(/^#/, '')
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) return `#${hex.toUpperCase()}`
  return undefined
}
```

### 3.2 Artist 数据结构演进

```typescript
interface Artist {
  id: string
  nameJa: string
  nameEn?: string
  role: ArtistRole
  series?: SeriesBrand[]
  portraitUrl?: string
  portraitSource?: 'wiki' | 'wikidata'
  bio?: string
  trackIds?: string[]
  releaseIds?: string[]
  cvId?: string
  cvWikidataId?: string
  characterIds?: string[]
  unitIds?: string[]
  memberIds?: string[]
  color?: string
}
```

**新增辅助文件**：`data/artist-relations.json`

```typescript
interface ArtistRelations {
  idolToCv: Record<string, string>
  cvToIdols: Record<string, string[]>
  unitToMembers: Record<string, string[]>
  idolToUnits: Record<string, string[]>
}
```

### 3.3 艺人详情页 UI 升级

- **头像区域**：圆形/圆角矩形头像，背景使用 `color` 的 10% 透明度渐变
- **关系卡片**："配音角色"（CV 页）/ "声优"（Idol 页）/ "所属组合" 横向滚动卡片
- **代表色标签**：页面顶部或头像边框使用 `color` 点缀

---

## 4. Phase 8.3 — PWA 支持

### 4.1 目标

- 独立全屏运行（无浏览器地址栏）
- 离线缓存核心页面（首页、收藏页）
- 启动画面使用企划品牌色

### 4.2 技术方案

手动配置 Service Worker（Next.js 静态导出限制，不使用 next-pwa）：

```
public/
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192x192.png
    ├── icon-512x512.png
    └── apple-touch-icon.png
```

**SW 策略**：Cache First（静态页面）/ Network First（音频）/ Stale While Revalidate（图片）

### 4.3 设计交付物

- 192×192 和 512×512 App Icon
- iOS `apple-touch-icon.png`

---

## 5. 实施路线图与里程碑

### 5.1 Sprint 划分

| Sprint | 周期 | 目标 | 关键产出 | 依赖 |
|---|---|---|---|---|
| **8.1a** | W1 | MusicBrainz 基础设施 | `pipeline/musicbrainz.ts` 封装（Release + Recording 两级） | 无 |
| **8.1b** | W1-W2 | Release-level 批量打底 | `mb_release_patches_*.json`，覆盖率 ≥60% | 8.1a |
| **8.1c** | W2 | Recording-level 精修 | `mb_recording_patches_*.json`，叠加覆盖率 ≥75% | 8.1b |
| **8.1d** | W2-W3 | VGMdb 补充 + 合并引擎 | `vgm_patches_*.json` + `pipeline-merge.ts` Credits 合并 | 8.1c |
| **8.1e** | W2-W3（并行）| 萌娘百科歌词抓取 | `lyrics_moegirl_*.json` | 无 |
| **8.1f** | W3（并行）| Wiki 歌词提取 + 合并 | `lyrics_wiki_*.json` + 歌词合并 | 8.1e |
| **8.2a** | W2-W3（并行）| imasparql v2 深化 | `pipeline-imasparql-v2.ts`，关系图谱 + 颜色 + 头像 | 无 |
| **8.2b** | W3-W4 | 艺人页 UI 升级 | `/artist/[id]` 头像 + 关系卡片 + 代表色 | 8.2a |
| **8.3** | W4 | PWA 配置 | `manifest.json` + `sw.js` + 图标 | 无 |
| **8.4** | W5 | 验收与回归测试 | 全量 Playwright 通过，数据质量报告 | 全部前置 |

### 5.2 验收标准

**8.1 Credits + 歌词 + 元数据**：
- [ ] Release-level Credits 覆盖率 ≥ 60%
- [ ] Recording-level 精修后总覆盖率 ≥ 75%
- [ ] Catalog Number 覆盖率 ≥ 50%
- [ ] Label 覆盖率 ≥ 30%
- [ ] 歌词覆盖率 ≥ 30%（至少一种语言）
- [ ] 合并冲突报告 ≤ 5%

**8.2 艺人深化**：
- [ ] Idol ↔ CV 关联覆盖率 72.5%
- [ ] Portrait URL 覆盖率 ≥ 60%（角色立绘 + CV 照片双源）
- [ ] Color Hex 标准化率 100%
- [ ] artist-relations.json 成功生成

**8.3 PWA**：
- [ ] Lighthouse PWA 评分 ≥ 90
- [ ] 离线可访问首页/收藏

---

## 6. 风险与缓解策略

| 风险 | 概率 | 影响 | 缓解措施 |
|---|---|---|---|
| MusicBrainz Rate Limit | 中 | 高 | 1 req/sec throttle + 断点续传 + checkpoint |
| MusicBrainz 日本动画音乐数据稀疏 | 高 | 中 | Release-level 打底降低粒度要求；VGMdb 补充；接受部分缺失 |
| VGMdb 反爬虫 | 中 | 中 | 3–5s 延迟 + User-Agent；如被封禁则降级为纯 MusicBrainz |
| 萌娘百科反爬虫 | 中 | 中 | 同上 |
| 歌词版权 | 中 | 高 | 非商业性质；如收到 DMCA 可快速移除 `lyrics` 字段 |
| Wiki dump 为空导致歌词覆盖率低 | 高 | 中 | 萌娘百科作为主要源；Wiki 需用户逐步积累 |
| imasparql 头像完全缺失 | 已确认 | 中 | 已设计双源替代方案 |

---

## 7. 数据结构演进对照表

### 7.1 Track

```diff
 interface Track {
   // ... 现有字段不变 ...
   credits: TrackCredit[]        // ← MusicBrainz + VGMdb 回填
+  lyricsJa?: string
+  lyricsZh?: string
+  lyricsEn?: string
+  lyricsRomaji?: string
+  lyricsSource?: Array<'wiki' | 'moegirl' | 'utanet' | 'manual'>
+  dataSource?: Array<'itunes' | 'musicbrainz' | 'vgmdb' | 'manual'>
+  confidence?: 'high' | 'medium' | 'low'
   coverUrl?: string
 }
```

### 7.2 Release

```diff
 interface Release {
   // ... 现有字段不变 ...
   catalogNumber?: string
   label?: string
+  mbReleaseId?: string
+  vgmdbUrl?: string
 }
```

### 7.3 Artist

```diff
 interface Artist {
   // ... 现有字段不变 ...
+  portraitUrl?: string
+  portraitSource?: 'wiki' | 'wikidata'
   cvId?: string
+  cvWikidataId?: string
   characterIds?: string[]
+  unitIds?: string[]
+  memberIds?: string[]
+  color?: string
 }
```

---

## 8. 附录

### 8.1 MusicBrainz API 快速参考

```bash
# 搜索 Release（按 catalog number）
curl -A "iM@S-Archive/0.4.0" \
  "https://musicbrainz.org/ws/2/release/?query=catalogNumber:LACM-14251&fmt=json"

# 获取 Release 详情（含 tracks + credits + labels）
curl -A "iM@S-Archive/0.4.0" \
  "https://musicbrainz.org/ws/2/release/{mbid}?inc=recordings+artist-rels+labels&fmt=json"

# 搜索 Recording
curl -A "iM@S-Archive/0.4.0" \
  "https://musicbrainz.org/ws/2/recording/?query=recording:"M@STERPIECE"+release:"THE+IDOLM@STER"&fmt=json"
```

### 8.2 Artist ID 映射策略

MusicBrainz/VGMdb 返回的是创作者**名字字符串**（如 `"神前暁"`），需要与项目内 `data/artists.json` 中的 `nameJa` 模糊匹配。**用户确认：匹配失败时自动创建 `role: 'CREATOR'` 的新 Artist 记录。**

### 8.3 文件索引

| 文件 | 用途 | Phase 8 动作 |
|---|---|---|
| `data/tracks.json` | 曲目主数据 | 合并 credits + lyrics + 置信度标记 |
| `data/releases.json` | 发行物主数据 | 合并 catalogNumber + label |
| `data/artists.json` | 艺人主数据 | 深化 portrait + color + relations |
| `data/artist-relations.json` | 关系图谱（新增） | 8.2a 生成 |
| `scripts/pipeline/*.ts` | 流水线模块 | 8.1a~8.3 逐步创建 |
| `public/manifest.json` | PWA 清单 | 8.3 创建 |
| `public/sw.js` | Service Worker | 8.3 创建 |

---

*本文档为 Phase 8 的顶层设计规划。各 Sprint 的具体实施细节将在执行前进一步细化。*
