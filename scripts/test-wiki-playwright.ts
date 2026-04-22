/**
 * Playwright 探针 v3 — 输出实际页面内容
 */
import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()

  console.log('=== Test: Wiki page (READY!!) ===')
  const wikiUrl = 'https://project-imas.wiki/READY!!'
  try {
    const response = await page.goto(wikiUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    console.log('Status:', response?.status())

    // 多等一会儿让 CF challenge 完成
    console.log('Waiting 10s for challenge...')
    await page.waitForTimeout(10000)

    const title = await page.title()
    console.log('Title:', title)

    const bodyText = await page.textContent('body')
    console.log('\n=== Body text (first 600 chars) ===')
    console.log(bodyText?.slice(0, 600))

    // 检查是否有 Wiki 内容特征
    const hasWikiContent = bodyText?.includes('Songbox') || bodyText?.includes('作词') || bodyText?.includes('作曲')
    const hasCF = bodyText?.includes('Just a moment') || bodyText?.includes('请稍候') || bodyText?.includes('Checking your browser')

    console.log('\n=== Detection ===')
    console.log('Has Wiki content:', hasWikiContent)
    console.log('Has CF challenge:', hasCF)

    // 尝试截图
    await page.screenshot({ path: 'scripts/wiki-test-screenshot.png', fullPage: true })
    console.log('Screenshot saved to scripts/wiki-test-screenshot.png')

  } catch (e: any) {
    console.log('Error:', e.message)
  }

  await browser.close()
}

main().catch(console.error)
