# Wiki 半自动数据录入流程

## 操作流程

### 1. 查询 Wiki 页面
打开 [project-imas.wiki](https://project-imas.wiki/Main_Page)，搜索曲目。

### 2. 复制页面全文
在 Wiki 页面上 **Ctrl+A** 全选 → **Ctrl+C** 复制。

### 3. 双击运行脚本
双击 `scripts/add-wiki-dump.bat`，脚本自动读取剪贴板 → 识别曲名 → 保存到 `wiki-dumps/`。

> 如果自动识别失败（曲名显示不对），请检查复制的是否是歌曲页面（不是系列主页或角色页）。

### 4. 运行合并脚本
全部录完后：
```bash
npx tsx scripts/merge-wiki-supplement.ts
```

脚本会自动：
- 解析所有 `.txt` 文件中的 `Composer` / `Lyricist` / `Arranger` / `BPM` / `Description`
- 按曲名匹配 `tracks.json` 中的曲目（支持去除括号副标题的模糊匹配）
- 自动创建 `artists.json` 中缺失的创作者条目
- 更新 `tracks.json` 的 `credits` / `bpm` / `titleRomaji` / `description`

---

## 18 首曲目 Wiki 链接速查

| # | 曲目 (tracks.json) | Wiki 页面 (project-imas.wiki) | 备注 |
|---|-------------------|------------------------------|------|
| 1 | M@STERPIECE | [M@STERPIECE](https://project-imas.wiki/M@STERPIECE) | |
| 2 | READY!! | [READY!!](https://project-imas.wiki/READY!!) | |
| 3 | Change to Chance (Off Vocal) | [Change to Chance](https://project-imas.wiki/Change_to_Chance) | 查主页面，含 Off Vocal 信息 |
| 4 | GO MY WAY!! (M@STER VERSION) | [GO MY WAY!!](https://project-imas.wiki/GO_MY_WAY!!) | 查主页面 |
| 5 | Study Equal Magic! | [Study Equal Magic!](https://project-imas.wiki/Study_Equal_Magic!) | |
| 6 | ダイヤモンド・クラリティ | [Diamond Clarity](https://project-imas.wiki/Diamond_Clarity) 或日文 | Shiny Colors |
| 7 | カウントダウンラブ | [Countdown Love](https://project-imas.wiki/Countdown_Love) 或日文 | |
| 8 | 無自覚アプリオリ | [Mujikaku Apriori](https://project-imas.wiki/Mujikaku_Apriori) 或日文 | |
| 9 | 合言葉はスタートアップ! | [Aikotoba wa Start Up!](https://project-imas.wiki/Aikotoba_wa_Start_Up!) | |
| 10 | バベルシティ・グレイス (2023 Ver.) | [Babel City Grace](https://project-imas.wiki/Babel_City_Grace) | 查主页面 |
| 11 | Ambitious Eve (アルストロメリア Ver.) | [Ambitious Eve](https://project-imas.wiki/Ambitious_Eve) | 查主页面 |
| 12 | ルピラ | [Rupira](https://project-imas.wiki/Rupira) 或日文 | |
| 13 | abyss of conflict (2023 Ver.) | [abyss of conflict](https://project-imas.wiki/abyss_of_conflict) | 查主页面 |
| 14 | Brand New Theater! (765PRO ALLSTARS ver.) | [Brand New Theater!](https://project-imas.wiki/Brand_New_Theater!) | 查主页面 |
| 15 | WINDING ROAD | [WINDING ROAD](https://project-imas.wiki/WINDING_ROAD) |  cover 曲，可能无档案 |
| 16 | UNION!! | [UNION!!](https://project-imas.wiki/UNION!!) | |
| 17 | Flyers!!! | [Flyers!!!](https://project-imas.wiki/Flyers!!!) | |
| 18 | アイ NEED YOU(FOR WONDERFUL STORY) | [アイ NEED YOU(FOR WONDERFUL STORY)](https://project-imas.wiki/%E3%82%A2%E3%82%A4_NEED_YOU(FOR_WONDERFUL_STORY)) | |

> **注意**：若某首在 project-imas.wiki 查不到，可尝试 [萌娘百科](https://zh.moegirl.org.cn/) 作为备选。但脚本目前只针对 project-imas.wiki 的页面格式优化。

---

## 匹配规则

脚本按以下优先级匹配曲目：

1. **精确匹配** `Original title` / `Translated title` → `track.titleJa`
2. **模糊匹配** 忽略大小写和空格
3. **去除副标题** 如 `GO MY WAY!! (M@STER VERSION)` → 匹配 `GO MY WAY!!`

如果仍然未匹配，脚本会提示 **"未匹配到 tracks.json 中的曲目"**，请检查文件名或 Wiki 页面标题。
