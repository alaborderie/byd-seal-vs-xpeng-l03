import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const usage = 'usage: node scripts/shoot.mjs <url> <outDir> [width] [height] [scrollY,...] [--reduced-motion]'
const [url, outDir, width = '1440', height = '900', scrolls = '0', ...flags] = process.argv.slice(2)
if (!url || !outDir) throw new Error(usage)

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  reducedMotion: flags.includes('--reduced-motion') ? 'reduce' : 'no-preference',
})
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.goto(url, { waitUntil: 'networkidle' })
for (const target of scrolls.split(',')) {
  const [anchor, offset = '0'] = target.split('+')
  const y = anchor.startsWith('#')
    ? (await page.locator(anchor).evaluate((el) => el.getBoundingClientRect().top + window.scrollY)) + Number(offset)
    : Number(target)
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(1200)
  const name = `${outDir}/${width}x${height}-${target.replace(/[#+]/g, '')}.png`
  await page.screenshot({ path: name })
  console.log(name)
}
const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
console.log(JSON.stringify({ pageHeight, overflowX, errors }))
await browser.close()
