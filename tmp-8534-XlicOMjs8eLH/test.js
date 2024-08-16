import puppeteer from '@dword-design/puppeteer'

const browser = await puppeteer.launch()
await browser.close()