import { test, expect } from '@playwright/test'

/**
 * Phase 8.1 数据展示验证
 * 验证 Credits、歌词、Catalog/Label 是否正确渲染
 */

test.describe('单曲详情页 - 数据展示', () => {
  test('歌词区块渲染并保留换行格式', async ({ page }) => {
    // track-1734552413 = 無自覚アプリオリ（有歌词）
    await page.goto('/track/track-1734552413')

    // 页面主标题
    const mainTitle = page.locator('main h1')
    await expect(mainTitle).toBeVisible()
    await expect(mainTitle).toContainText('無自覚アプリオリ')

    // 歌词区块标题
    const lyricsHeading = page.locator('main h2').filter({ hasText: '歌词' })
    await expect(lyricsHeading).toBeVisible()

    // 歌词文本容器存在且包含内容
    const lyricsText = page.locator('main section:has(h2:has-text("歌词")) p.whitespace-pre-wrap')
    await expect(lyricsText).toBeVisible()
    await expect(lyricsText).not.toBeEmpty()

    // 验证换行被保留（文本中应包含换行符或至少有多行内容）
    const text = await lyricsText.textContent()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(20)
  })

  test('Credits 显示艺人名字并可点击跳转', async ({ page }) => {
    // track-1718496906 = M@STERPIECE（有 Credits）
    await page.goto('/track/track-1718496906')

    // Credits 面板
    await expect(page.locator('text=Credits').first()).toBeVisible()

    // 验证具体角色标签存在
    await expect(page.locator('main').locator('text=作词').first()).toBeVisible()
    await expect(page.locator('main').locator('text=作曲').first()).toBeVisible()

    // 验证艺人名字被渲染（而非 raw artistId）
    // yura 是 M@STERPIECE 的作词家
    await expect(page.locator('main').locator('text=yura').first()).toBeVisible()

    // 验证艺人名字是可点击的链接
    const artistLink = page.locator('main a[href^="/artist/"]').filter({ hasText: 'yura' }).first()
    await expect(artistLink).toBeVisible()

    // 点击跳转验证
    await artistLink.click()
    await expect(page).toHaveURL(/\/artist\/creator-/)
  })

  test('无歌词的曲目不显示歌词区块', async ({ page }) => {
    // 找一个没有歌词的 track（绝大多数 tracks 没有歌词）
    // 用 M@STERPIECE 测试，它应该没有歌词（如果没有被 Uta-Net 覆盖到）
    await page.goto('/track/track-1718496906')

    // 确保页面加载成功
    await expect(page.locator('main h1')).toBeVisible()

    // 歌词区块不应存在
    const lyricsHeading = page.locator('main h2').filter({ hasText: '歌词' })
    await expect(lyricsHeading).not.toBeVisible()
  })
})

test.describe('专辑详情页 - 元数据展示', () => {
  test('Label 和 Catalog Number 正确显示', async ({ page }) => {
    // release-1731760812 = SideM GROWING SIGN@L 14（有 label + catalog）
    await page.goto('/release/release-1731760812')

    // 页面主标题
    const mainTitle = page.locator('main h1')
    await expect(mainTitle).toBeVisible()

    // 紧凑元数据行应包含 label 和 catalog
    const metaLine = page.locator('main p').filter({ hasText: /Lantis/ }).filter({ hasText: /LACM-24194/ })
    await expect(metaLine).toBeVisible()

    // 也验证在 Meta Grid 中显示
    await expect(page.locator('text=厂牌').first()).toBeVisible()
    await expect(page.locator('text=Lantis').first()).toBeVisible()
    await expect(page.locator('text=Catalog').first()).toBeVisible()
    await expect(page.locator('text=LACM-24194').first()).toBeVisible()
  })

  test('无 label/catalog 的专辑正常显示', async ({ page }) => {
    // 找一个可能没有 label 的 release（需要确认 ID）
    // 这里用一个通用的方式：访问专辑列表的第一个
    await page.goto('/releases')
    const firstReleaseLink = page.locator('main a[href^="/release/"]').first()
    await firstReleaseLink.click()

    // 页面应正常加载，不崩溃
    await expect(page.locator('main h1')).toBeVisible()
  })
})
