// Test Puppeteer in production mode
const puppeteer = require('puppeteer')

async function testPuppeteerProduction() {
  console.log('🧪 Testing Puppeteer for Render.com production...')
  
  try {
    // Set production environment
    process.env.NODE_ENV = 'production'
    
    const chromium = require('@sparticuz/chromium')
    
    console.log('📦 Testing chromium binary...')
    const executablePath = await chromium.executablePath()
    console.log('✅ Chromium executable path:', executablePath)
    
    console.log('🚀 Launching Puppeteer...')
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-zygote',
        '--deterministic-fetch',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })
    
    console.log('📄 Creating test page...')
    const page = await browser.newPage()
    await page.setContent(`
      <html>
        <head><title>Render.com Test</title></head>
        <body>
          <h1>PDF Test for Render.com</h1>
          <p>This is a test PDF generation on Render.com platform.</p>
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJyZWQiIC8+Cjwvc3ZnPgo=" alt="Test Image" />
        </body>
      </html>
    `)
    
    console.log('📊 Generating PDF...')
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    })
    
    console.log('✅ PDF generated successfully!')
    console.log(`📏 PDF size: ${pdf.length} bytes`)
    
    await browser.close()
    
    console.log('🎉 Render.com production test completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log(`  ✅ Chromium binary: Available`)
    console.log(`  ✅ Puppeteer launch: Success`)
    console.log(`  ✅ PDF generation: Success (${pdf.length} bytes)`)
    console.log('')
    console.log('🚀 Ready for Render.com deployment!')
    
  } catch (error) {
    console.error('❌ Production test failed:')
    console.error(error.message)
    console.error('')
    console.error('🔧 Possible solutions:')
    console.error('  1. Check @sparticuz/chromium installation')
    console.error('  2. Verify Render.com memory limits')
    console.error('  3. Check NODE_OPTIONS environment variable')
    process.exit(1)
  }
}

testPuppeteerProduction()
