import puppeteer from 'puppeteer'
import { NextApiRequest, NextApiResponse } from 'next'

interface SuccessResponse {
  title: string | null
}

interface ErrorResponse {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
): Promise<void> {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    const page = await browser.newPage()

    // Example: Navigate to a page and get the title
    await page.goto('https://developer.chrome.com/', {
      waitUntil: 'networkidle0'
    })
    await page.setViewport({ width: 1080, height: 1024 })

    // Type into search box using accessible input name
    await page.locator('aria/Search').fill('automate beyond recorder')

    // Wait and click on first result
    await page.locator('.devsite-result-item-link').click()

    // Locate the full title with a unique string
    await page.waitForSelector('text/Customize and automate')
    const fullTitle: string | null = await page.$eval(
      'text/Customize and automate',
      (el: Element) => el.textContent
    )

    await browser.close()

    res.status(200).json({ title: fullTitle })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
