# iM@S Archive

> 一个面向 THE IDOLM@STER 系列的非官方音乐资料库。
> 浏览歌曲、发行物、艺人和创作者，发现不同企划的音乐作品，并试听可用的音频片段。

[在线体验](https://master.imas-music.pages.dev) · [GitHub 仓库](https://github.com/ShinonomeAya/ImasMusic)

## 项目简介

iM@S Archive 将 THE IDOLM@STER 六大企划的音乐资料集中在一个可搜索、可探索的界面中：

- 765PRO ALLSTARS
- Cinderella Girls
- Million Live!
- SideM
- Shiny Colors
- 学园偶像大师（Gakuen iDOLM@STER）

项目采用温暖的编辑风格设计，支持桌面端和移动端访问。它更适合作为音乐目录、资料查询和探索工具，而不是完整的音乐串流服务。

## 数据概览

数据量以仓库当前 `data/` 目录中的 JSON 文件为准，最近一次数据更新至 2026-07-09：

| 数据 | 数量 |
| --- | ---: |
| 曲目 | 4,179 |
| 发行物 | 764 |
| 艺人和创作者 | 1,039 |
| 其中偶像 | 344 |
| 其中创作者 | 695 |

## 功能

- 按企划浏览发行物、曲目和艺人
- 搜索歌曲、发行物、艺人和创作者
- 查看发行物详情、曲目列表、演唱者和制作人员信息
- 查看歌词、BPM、时长、调性等已收录资料
- 使用 iTunes 提供的音频试听片段播放歌曲
- 播放队列、上一首/下一首、循环和随机播放
- 收藏曲目，并在本地保存收藏列表
- 通过曲风地图等可视化页面探索数据
- 支持键盘快捷键、亮色/暗色主题和移动端操作

试听内容取决于数据源是否提供 `previewUrl`；没有试听链接的曲目仍可作为资料浏览。

## 本地运行

### 环境要求

- Node.js 20 或更高版本
- npm

### 安装与启动

```bash
git clone https://github.com/ShinonomeAya/ImasMusic.git
cd ImasMusic
npm ci
npm run dev
```

启动后打开 <http://localhost:3000>。

### 常用命令

```bash
# 类型检查
npm run type-check

# 生成生产版本
npm run build
```

项目使用 Next.js 静态导出，生产构建结果输出到 `dist/`。数据在构建时从 `data/` 目录读取，不依赖运行时数据库或服务端 API。

## 项目结构

```text
app/          页面和路由
components/   可复用界面组件
data/         曲目、发行物和艺人数据
lib/          数据查询、播放器状态和工具函数
scripts/      数据导入与补充脚本
docs/         设计文档和项目记录
public/       静态资源
```

## 数据来源

项目使用多个公开数据源整理音乐资料，包括：

- [iTunes Search API](https://itunes.apple.com/search)：发行物封面、试听链接等
- [MusicBrainz](https://musicbrainz.org/)：发行物和制作人员信息
- [imasparql](https://sparql.crssnky.xyz/spql/imas/query)：偶像资料
- Uta-Net 等公开资料来源：歌词和补充信息

不同来源的覆盖范围和准确度可能不同，页面中的字段不代表所有资料都已完整核实。如果发现错误或遗漏，欢迎提交 [Issue](https://github.com/ShinonomeAya/ImasMusic/issues)。

## 开发与部署

推送到 `main` 或 `master` 分支后，GitHub Actions 会构建项目并部署到 Cloudflare Pages。部署配置位于 `.github/workflows/deploy.yml`。

如果需要更新数据，可修改 `data/` 中对应的 JSON 文件，完成后运行：

```bash
npm run type-check
npm run build
```

## 版权与免责声明

- THE IDOLM@STER、相关角色、音乐和图像的版权归各自权利人所有。
- 本项目为非官方同人资料库，与 THE IDOLM@STER 官方及相关公司没有隶属或授权关系。
- 本项目不提供完整音乐文件；试听链接由外部服务提供，播放时遵循对应服务的规则。
- 仓库当前未附带独立的 `LICENSE` 文件。复用代码、数据或资源前，请先联系作者并确认许可范围。

## 参与贡献

欢迎通过以下方式参与：

- 提交资料错误、缺失信息或功能建议
- 提交修复或改进的 Pull Request
- 分享使用反馈和新的数据来源

提交数据修改时，请尽量附上来源链接或其他可核对信息。
