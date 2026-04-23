# 部署指南 —— Cloudflare Pages

## 方案 A：GitHub Actions 自动部署（推荐）

已配置 `.github/workflows/deploy.yml`，每次 push 到 `main` 分支自动构建并部署。

### 步骤

#### 1. 在 Cloudflare 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 右侧边栏找到 **Account ID**，复制保存

#### 2. 创建 API Token

1. 进入 [API Tokens](https://dash.cloudflare.com/profile/api-tokens) 页面
2. 点击 **Create Token**
3. 选择 **Custom token**
4. 配置权限：
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Zone** → **Page Rules** → **Edit**（可选，如果需要自定义域名）
5. 点击 **Continue to summary** → **Create Token**
6. 复制 Token（**只显示一次，务必保存**）

#### 3. 在 GitHub 仓库设置 Secrets

1. 打开仓库 `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`，添加以下两个 secret：

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | 刚才创建的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Account ID |

3. （可选）在 `Variables` 标签页添加：

| Name | Value |
|------|-------|
| `CLOUDFLARE_PAGES_PROJECT_NAME` | 项目名，如 `imas-music`（默认） |

#### 4. 首次创建 Cloudflare Pages 项目

**方式一：Wrangler CLI（推荐）**

```bash
npx wrangler login
npx wrangler pages project create imas-music
```

**方式二：Dashboard**

1. 进入 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. 点击 **Create a project** → **Upload assets**
3. 项目名填 `imas-music`
4. 随便上传一个空文件完成创建（后续 GitHub Actions 会自动覆盖）

#### 5. 推送代码触发部署

```bash
git add .
git commit -m "chore: add Cloudflare Pages deployment"
git push origin main
```

然后到 GitHub 仓库的 `Actions` 标签页查看部署进度。

---

## 方案 B：Wrangler CLI 手动部署

适合想立即看到效果、不依赖 GitHub 的场景。

```bash
# 1. 登录 Cloudflare（会打开浏览器）
npx wrangler login

# 2. 创建项目（首次需要）
npx wrangler pages project create imas-music

# 3. 部署
cd "F:\sokusai\My project\ImasMusic"
npx wrangler pages deploy dist --project-name=imas-music
```

部署成功后会输出访问链接，例如：
```
✨ Successfully published your site to:
https://imas-music.pages.dev
```

---

## 方案 C：Cloudflare Dashboard 拖拽上传

零配置、最直观，但需每次手动上传。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** → **Create a project** → **Upload assets**
3. 项目名填 `imas-music`
4. 拖拽 `dist/` 文件夹到上传区域
5. 等待上传完成，即可获得 `https://imas-music.pages.dev`

---

## 绑定自定义域名

1. 在 Cloudflare Pages 项目里进入 **Custom domains**
2. 添加你的域名（如 `music.yourdomain.com`）
3. 按提示添加 DNS 记录（如果域名也在 Cloudflare 托管，会自动配置）

---

## 常见问题

**Q: 部署后图片/音频加载失败？**  
A: 检查 `next.config.js` 中 `images.unoptimized: true` 已设置。如果使用了自定义域名，确保 CORS 设置允许跨域。

**Q: 构建产物太大？**  
A: Cloudflare Pages 免费版限制每次部署 500MB。当前 `dist` 约为几十 MB，远未触及限制。

**Q: 如何回滚？**  
A: Cloudflare Pages 保留最近 10 次部署，在 Dashboard 里可以直接切换版本。
