# Phase 2: 数据层重构与脚手架 (Data Layer & Scaffolding)

> 状态: 🚧 NOT STARTED
> 前置依赖: Phase 1 完成 ✅
> 目标: 统一数据模型，搭建自动化数据导入脚手架

---

## 任务清单

### 1. 数据目录结构
```
data/
  seed/                   # 种子数据目录
    input/                # 用户提供的原始曲目列表 (.txt)
    output/               # 脚手架生成的 JSON 数据
  schema/                 # 数据校验 schema
```

### 2. 统一数据模型实现
- [ ] 重写 `lib/data.ts` → 基于新类型的数据聚合与查询 API
- [ ] 创建 `data/releases.json` — 发行物数据（空壳/脚手架输出）
- [ ] 创建 `data/tracks.json` — 曲目数据（空壳/脚手架输出）
- [ ] 创建 `data/artists.json` — 艺人数据（空壳/脚手架输出）

### 3. 数据导入脚手架 (Scaffolding)
- [ ] 创建 `app/api/seed/route.ts` — Next.js Route Handler 形式的脚手架接口
  - 接收 POST 请求（曲目列表文本）
  - 调用 iTunes Search API 匹配元数据
  - ~~调用 Spotify Web API 获取 audio-features~~ ⏸️ 搁置
  - 输出标准化 JSON
- [ ] 创建 `scripts/seed-cli.ts` — Node.js CLI 版本（独立运行）
- [ ] 错误处理与重试机制（API rate limit）
- [ ] 数据去重与合并策略

### 4. API 配置管理
- [ ] 创建 `.env.local` 模板（~~SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET~~ ⏸️ 搁置）
- [ ] ~~Spotify Client Credentials Flow 实现（获取 access_token）~~ ⏸️ 搁置

### 5. 服务端数据层
- [ ] 创建 `lib/api/itunes.ts` — iTunes Search API 封装
- [ ] ~~创建 `lib/api/spotify.ts` — Spotify Web API 封装~~ ⏸️ 搁置（待获取 Client ID/Secret 后激活）
- [ ] 创建 `lib/api/audio.ts` — 音频预览 URL 获取（iTunes previewUrl）

### 6. ISR 配置
- [ ] 详情页 ISR 配置 (revalidate: 86400)

---

## 前置条件（阻塞项）

⚠️ **需要用户提供 Spotify Developer 账号凭证**:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

> 若暂不提供，可先实现 iTunes API 部分（封面/试听/基础元数据），Spotify audio-features 留空占位。

---

## 接口设计草案

### iTunes Search API 封装
```typescript
// 搜索专辑/单曲
searchItunes(query: string, entity: 'album' | 'song'): Promise<ItunesResult[]>

// 获取 30秒试听 URL
getPreviewUrl(trackId: number): string
```

### ~~Spotify Web API 封装~~ ⏸️ 搁置
```typescript
// 获取 access_token (Client Credentials)
getSpotifyToken(): Promise<string>

// 搜索曲目
searchSpotify(query: string): Promise<SpotifyTrack[]>

// 获取音频特征
getAudioFeatures(trackId: string): Promise<{
  energy: number
  valence: number
  tempo: number
  key: number
  mode: number
}>
```
> **状态**: 待获取 Spotify Client ID/Secret 后激活。当前 energy/valence/BPM/key/mode 字段留空占位。

### 脚手架 CLI
```bash
# 通过 txt 文件导入
npx ts-node scripts/seed-cli.ts --input data/seed/input/765.txt --series 765 --output data/seed/output/

# 或直接 POST 到 API
POST /api/seed
Body: { text: "曲目列表...", series: "765" }
```

---

## 设计决策记录

| 决策 | 说明 |
|---|---|
| 数据格式 | JSON 文件（阶段一），未来可迁移到数据库 |
| 脚手架位置 | 同时提供 API Route + CLI 脚本，灵活使用 |
| API 密钥管理 | .env.local + process.env，不提交到 Git |
| Rate Limit | iTunes: 20 req/min, ~~Spotify: 无限制(Client Credentials)~~ |
| 图片域名 | 已配置 6 个 is*-ssl.mzstatic.com + i.ytimg.com |
