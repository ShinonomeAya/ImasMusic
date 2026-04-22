#!/usr/bin/env python3
"""
测试 Playwright 是否能绕过 Cloudflare 访问 Project iM@S Wiki
"""

import asyncio
from playwright.async_api import async_playwright


async def test_wiki():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        # 访问 Wiki 的 READY!! 页面
        url = "https://project-imas.wiki/api.php?action=parse&page=READY!!&prop=wikitext&format=json"
        print(f"Navigating to: {url}")

        try:
            response = await page.goto(url, wait_until="networkidle", timeout=30000)
            print(f"Response status: {response.status if response else 'None'}")
            print(f"Response URL: {response.url if response else 'None'}")

            content = await page.content()
            # 检查是 JSON 还是 CF challenge HTML
            if content.strip().startswith("{"):
                print("\n✅ SUCCESS: Got JSON response!")
                print(content[:2000])
            elif "Just a moment" in content or "cf-browser-verification" in content:
                print("\n❌ FAILED: Cloudflare challenge page still showing")
                print(content[:500])
            else:
                print("\n⚠️ UNEXPECTED response:")
                print(content[:1000])

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(test_wiki())
