import { test, expect } from '@playwright/test'

/**
 * 移动端核心功能测试
 * 设备: iPhone SE / iPhone 14 Pro
 */

test.describe('首页', () => {
  test('加载成功并显示统计数据', async ({ page }) => {
    await page.goto('/')

    // 标题显示（用 role + level 精确定位 Hero 标题）
    const heroHeading = page.locator('section h1').first()
    await expect(heroHeading).toContainText('THE IDOLM@STER')
    await expect(heroHeading).toContainText('音乐数据库')

    // 统计卡片
    await expect(page.locator('text=3403').first()).toBeVisible()
    await expect(page.locator('text=收录曲目').first()).toBeVisible()
    await expect(page.locator('text=734').first()).toBeVisible()
    await expect(page.locator('text=发行专辑').first()).toBeVisible()

    // Hero 按钮
    await expect(page.getByRole('link', { name: /浏览曲库/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /探索数据/ })).toBeVisible()
  })

  test('底部导航栏可见', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'BottomNav 只在移动端显示')
    await page.goto('/')

    // BottomNav 在 <nav> 中
    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav).toBeVisible()

    // 5 个 Tab
    const navLinks = bottomNav.locator('a')
    await expect(navLinks).toHaveCount(5)
    await expect(navLinks.filter({ hasText: '首页' })).toBeVisible()
    await expect(navLinks.filter({ hasText: '专辑' })).toBeVisible()
    await expect(navLinks.filter({ hasText: '单曲' })).toBeVisible()
    await expect(navLinks.filter({ hasText: '艺人' })).toBeVisible()
    await expect(navLinks.filter({ hasText: '我的' })).toBeVisible()
  })
})

test.describe('侧边栏', () => {
  test('打开和关闭', async ({ page, isMobile }) => {
    test.skip(!isMobile, '移动端侧边栏 Drawer 只在移动端可用')
    await page.goto('/')

    // 点击汉堡按钮打开侧边栏（header 里的第一个 button）
    const menuBtn = page.locator('header button').first()
    await menuBtn.click()

    // 侧边栏 Drawer 出现（移动端，排除桌面版 hidden md:flex）
    const drawer = page.locator('aside.md\\:hidden.fixed.left-0.top-0')
    await expect(drawer).toBeVisible()

    // 侧边栏内容可见（用精确文本匹配在 Drawer 内查找）
    await expect(drawer.locator('text=探索').first()).toBeVisible()
    await expect(drawer.locator('text=全部系列').first()).toBeVisible()

    // 点击关闭按钮（Drawer 里的 X 按钮）
    const closeBtn = drawer.locator('button').filter({ has: page.locator('svg') }).first()
    await closeBtn.click()

    // 侧边栏关闭
    await expect(drawer).not.toBeVisible()
  })
})

test.describe('专辑详情页', () => {
  test('加载并显示曲目列表', async ({ page }) => {
    await page.goto('/release/release-1718496905')

    // 页面主标题（排除 Sidebar Logo）
    const mainTitle = page.locator('main h1')
    await expect(mainTitle).toBeVisible()

    // 收录曲目
    await expect(page.locator('text=收录曲目').first()).toBeVisible()

    // 至少有一首曲目
    const tracklist = page.locator('main').locator('a[href^="/track/"]')
    await expect(tracklist.first()).toBeVisible()
  })
})

test.describe('曲目详情页', () => {
  test('加载并显示 Credits', async ({ page }) => {
    await page.goto('/track/track-1718496906')

    // 页面主标题
    const mainTitle = page.locator('main h1')
    await expect(mainTitle).toBeVisible()

    // Credits 面板（桌面端显示，手机端可能隐藏）
    await expect(page.locator('text=Credits').first()).toBeVisible()
  })
})

test.describe('底部导航栏切换', () => {
  test('各 Tab 可正常跳转', async ({ page, isMobile }) => {
    test.skip(!isMobile, '底部导航栏只在移动端显示')
    await page.goto('/')

    const bottomNav = page.locator('nav.fixed.bottom-0')

    // 专辑 Tab
    await bottomNav.locator('a').filter({ hasText: '专辑' }).click()
    await expect(page).toHaveURL(/\/releases/)

    // 单曲 Tab
    await bottomNav.locator('a').filter({ hasText: '单曲' }).click()
    await expect(page).toHaveURL(/\/tracks/)

    // 艺人 Tab
    await bottomNav.locator('a').filter({ hasText: '艺人' }).click()
    await expect(page).toHaveURL(/\/artists/)

    // 我的 Tab
    await bottomNav.locator('a').filter({ hasText: '我的' }).click()
    await expect(page).toHaveURL(/\/favorites/)

    // 首页 Tab
    await bottomNav.locator('a').filter({ hasText: '首页' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
