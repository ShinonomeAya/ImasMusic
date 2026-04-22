/**
 * Playwright 探针 — 测试萌娘百科是否能访问
 */
import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()

  console.log('=== Test: 萌娘百科 GO MY WAY!! ===')
  try {
    const response = await page.goto('https://zh.moegirl.org.cn/GO_MY_WAY!!', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    console.log('Status:', response?.status())
    console.log('URL:', response?.url())

    await page.waitForTimeout(3000)

    const title = await page.title()
    console.log('Title:', title)

    const bodyText = await page.textContent('body')
    if (bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden')) {
      console.log('❌ Still blocked in browser')
    } else if (bodyText?.includes('作曲') || bodyText?.includes('作词') || bodyText?.includes('编曲')) {
      console.log('✅ Page accessible with music info!')
      // Extract relevant section
      const hasComposer = bodyText.includes('作曲')
      const hasLyricist = bodyText.includes('作词')
      const hasArranger = bodyText.includes('编曲')
      const hasBPM = bodyText.includes('BPM')
      console.log('作曲:', hasComposer, '| 作词:', hasLyricist, '| 编曲:', hasArranger, '| BPM:', hasBPM)
    } else {
      console.log('Page content preview:', bodyText?.slice(0, 300))
    }

    await page.screenshot({ path: 'scripts/moegirl-test-screenshot.png', fullPage: false })
    console.log('Screenshot saved')

  } catch (e: any) {
    console.log('Error:', e.message)
  }

  await browser.close()
}

main().catch(console.error)
