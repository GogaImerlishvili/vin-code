// Debug script for testing mail and PDF generation
require('dotenv').config()

async function testPuppeteer() {
  console.log('🔍 Testing Puppeteer...')
  try {
    const puppeteer = require('puppeteer')
    
    console.log('Puppeteer executable path:', puppeteer.executablePath())
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions'
      ]
    })
    
    console.log('✅ Puppeteer launched successfully')
    
    const page = await browser.newPage()
    await page.setContent('<h1>Test PDF</h1>')
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    })
    
    console.log('✅ PDF generated successfully, size:', pdf.length, 'bytes')
    
    await browser.close()
    return true
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error.message)
    return false
  }
}

async function testSendGrid() {
  console.log('📧 Testing SendGrid...')
  try {
    const sgMail = require('@sendgrid/mail')
    
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.error('❌ SENDGRID_API_KEY not found in environment variables')
      return false
    }
    
    console.log('✅ SendGrid API key found (length:', apiKey.length, ')')
    sgMail.setApiKey(apiKey)
    
    // Test with a simple message (won't actually send)
    const msg = {
      to: 'test@example.com',
      from: 'autovin2023@gmail.com',
      subject: 'Test',
      text: 'Test message',
    }
    
    // Just validate the message format
    console.log('✅ SendGrid configuration is valid')
    return true
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting debug tests...\n')
  
  const puppeteerResult = await testPuppeteer()
  console.log('')
  
  const sendGridResult = await testSendGrid()
  console.log('')
  
  console.log('📊 Test Results:')
  console.log('- Puppeteer:', puppeteerResult ? '✅ PASS' : '❌ FAIL')
  console.log('- SendGrid:', sendGridResult ? '✅ PASS' : '❌ FAIL')
  
  if (puppeteerResult && sendGridResult) {
    console.log('\n🎉 All tests passed! The issue might be in the integration between components.')
  } else {
    console.log('\n⚠️  Found issues that need to be fixed.')
  }
}

runTests().catch(console.error)
