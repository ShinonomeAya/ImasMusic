/**
 * 测试 Wiki dump 解析器
 * 用法: npx tsx scripts/test-parse-wiki.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { parseWikiDump } from './parse-wiki-dump'

const dumpPath = join(process.cwd(), 'data', 'seed', 'wiki-dumps', '私はアイドル♡.txt')
const text = readFileSync(dumpPath, 'utf-8')

const result = parseWikiDump(text)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('解析结果：')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(JSON.stringify(result, null, 2))
