/** @type {import('next').NextConfig} */
const puppeteer = require('puppeteer')

// Use Chrome binary for production (Render.com/Cloud environments)
const chromium =
  process.env.NODE_ENV === 'production' ? require('@sparticuz/chromium') : null

const nextConfig = {
  // For better compatibility with Render.com
  experimental: {
    outputFileTracingRoot: process.cwd(),
    esmExternals: false // Fix for Puppeteer in serverless
  },
  // Image optimization - disable for Render.com
  images: {
    domains: ['images.carfax.com', 'www.carfax.com', 'static.carfax.com'],
    unoptimized: true // Enable for Render.com
  },
  // Environment-specific build settings
  env: {
    CUSTOM_KEY: 'my-value'
  },
  // Serverless function configuration for Render.com
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic dependencies from webpack bundling
      config.externals = config.externals || []
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium'
      })
    }
    return config
  }
}

module.exports = {
  ...nextConfig,
  serverRuntimeConfig: {
    puppeteerInstance: async (retries = 3) => {
      let browser
      let lastError

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          if (process.env.NODE_ENV === 'production') {
            console.log(
              `[puppeteerInstance] Launching puppeteer for production (Render.com environment) - Attempt ${attempt}/${retries}`
            )
            browser = await puppeteer.launch({
              args: [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-zygote',
                '--deterministic-fetch',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-web-security',
                '--single-process' // Add this for ETXTBSY errors
              ],
              defaultViewport: chromium.defaultViewport,
              executablePath: await chromium.executablePath(),
              headless: chromium.headless,
              ignoreHTTPSErrors: true,
              timeout: 30000 // Increased timeout
            })
          } else {
            console.log(
              `[puppeteerInstance] Launching puppeteer for development (local) - Attempt ${attempt}/${retries}`
            )
            browser = await puppeteer.launch({
              headless: 'new',
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-extensions',
                '--single-process'
              ],
              timeout: 30000
            })
          }

          if (!browser) throw new Error('Could not create puppeteer instance')
          console.log('[puppeteerInstance] Puppeteer launched successfully')
          return browser
        } catch (err) {
          lastError = err
          console.error(
            `[puppeteerInstance] Error launching puppeteer (attempt ${attempt}/${retries}):`,
            err.message
          )

          // Wait before retry
          if (attempt < retries) {
            console.log(
              `[puppeteerInstance] Waiting 2 seconds before retry...`
            )
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        }
      }

      console.error(
        `[puppeteerInstance] Failed to launch puppeteer after ${retries} attempts`
      )
      throw lastError
    }
  }
}
