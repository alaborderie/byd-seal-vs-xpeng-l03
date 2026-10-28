import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(process.argv[2] ?? 'http://localhost:8519', { waitUntil: 'networkidle' })
await page.locator('#road-trip').scrollIntoViewIfNeeded()
await page.getByRole('radio', { name: /Lyon/ }).check({ force: true })
await page.waitForTimeout(1500)
await page.getByRole('radio', { name: 'Standard' }).check({ force: true })
await page.waitForTimeout(1500)
const legs = await page.locator('#road-trip .h-12 > div').evaluateAll((els) =>
  els.map((el) => getComputedStyle(el).transform),
)
const hidden = legs.filter((t) => t.startsWith('matrix(0,') || t.startsWith('matrix(0, ')).length
console.log(JSON.stringify({ legs: legs.length, hidden }))
if (legs.length === 0 || hidden > 0) process.exitCode = 1
await browser.close()
