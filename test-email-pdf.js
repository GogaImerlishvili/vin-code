// Test script to verify PDF generation and email sending
const fs = require('fs')
const path = require('path')

async function testEmailPDF() {
  console.log('🧪 Testing PDF email functionality...\n')

  try {
    console.log('📧 Making request to test-mail API...')
    const response = await fetch(
      'http://localhost:3000/api/test-mail?vin=5UXCY8C05L9B21317&vendor=autocheck&email=gogaimerlishvili1@gmail.com'
    )

    console.log('Response status:', response.status)

    if (response.status === 200) {
      const result = await response.text()
      console.log('✅ Email sent successfully!')
      console.log('Response:', result)
    } else {
      const error = await response.text()
      console.log('❌ Email failed!')
      console.log('Error:', error)
    }

    // Check if debug HTML file was created
    const debugHtmlPath = path.join(process.cwd(), 'debug-html.html')
    if (fs.existsSync(debugHtmlPath)) {
      const stats = fs.statSync(debugHtmlPath)
      console.log(`\n📄 Debug HTML file created: ${stats.size} bytes`)

      // Check for PDF-like content in the HTML
      const htmlContent = fs.readFileSync(debugHtmlPath, 'utf8')
      const base64Images = (htmlContent.match(/data:image/g) || []).length
      console.log(`🖼️  Base64 images in HTML: ${base64Images}`)
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run only if server is running
fetch('http://localhost:3000')
  .then(() => {
    console.log('🚀 Server is running, starting test...\n')
    testEmailPDF()
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start with: npm run dev')
  })
