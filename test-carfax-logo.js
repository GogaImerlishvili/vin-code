// მაღალი დონის ტესტი Carfax ლოგოს extraction-ისთვის
const generatePDF = require('./lib/generatePDF.ts').default

// კიდევ უფრო რეალისტიკური Carfax რეპორტის მაგალითი
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>CARFAX Vehicle History Report</title>
    <style>
        .carfax-logo { width: 150px; height: 50px; }
        .report-header { background: url('https://www.carfax.com/images/header-bg.jpg'); }
    </style>
</head>
<body>
    <div class="report-header">
        <img src="https://www.carfax.com/images/carfax_logo.png" alt="CARFAX" class="carfax-logo">
        <img src="https://cdn.carfax.com/assets/logo-white.svg" alt="CARFAX Logo" id="main-logo">
    </div>
    
    <div class="report-content">
        <h1>Vehicle History Report</h1>
        
        <!-- სხვადასხვა ტიპის ლოგოები -->
        <img src="https://static.carfax.com/graphics/carfax-badge.png" alt="Badge">
        <img src="https://assets.carfax.com/media/trust-logo.jpg" class="trust-logo">
        <img src="https://www.carfax.com/content/dam/carfax/global/logos/logo_horizontal.png">
        
        <!-- რეპორტის სურათები -->
        <img src="https://example.com/vehicle-photo.jpg" alt="Vehicle">
        <img src="https://carfax-reports.s3.amazonaws.com/icons/accident-icon.svg" alt="Accident">
        
        <!-- Background images in CSS -->
        <div style="background-image: url('https://www.carfax.com/images/watermark-logo.png');">
            <p>Report content with background logo...</p>
        </div>
        
        <!-- HTML entities და encoding ტესტები -->
        <img src="https://www.carfax.com/images/logo%20(1).png" alt="CARFAX&reg;">
    </div>
    
    <footer>
        <img src="https://carfax.com/footer-logo.png" class="footer-logo" id="carfax-footer">
        <p>&copy; 2024 CARFAX, Inc.</p>
    </footer>
</body>
</html>
`

async function runAdvancedTest() {
  try {
    console.log('🚀 Starting advanced Carfax logo extraction test...')
    console.log('📏 Input HTML length:', testHTML.length)

    // Environment variable-ის სეტინგი debug-ისთვის
    process.env.NODE_ENV = 'development'

    console.log('🔄 Calling generatePDF...')
    const pdfBuffer = await generatePDF(testHTML, 1)

    console.log('✅ PDF generated successfully!')
    console.log('📄 PDF size:', pdfBuffer.length, 'bytes')

    // შევინახოთ ტესტის PDF
    const fs = require('fs')
    fs.writeFileSync('test-advanced-carfax.pdf', pdfBuffer)
    console.log('� Advanced test PDF saved as test-advanced-carfax.pdf')

    // შევამოწმოთ debug HTML file
    if (fs.existsSync('debug-html.html')) {
      const debugContent = fs.readFileSync('debug-html.html', 'utf8')
      const base64Count = (debugContent.match(/data:image/g) || []).length
      console.log('🐛 Debug HTML contains', base64Count, 'base64 images')
      console.log('📁 Debug HTML file size:', debugContent.length, 'characters')
    }

    console.log('🎉 Test completed successfully!')
  } catch (error) {
    console.error('❌ Advanced test failed:', error.message)
    console.error('📚 Stack trace:', error.stack)
  }
}

// გაუშვით advanced ტესტი
runAdvancedTest()
