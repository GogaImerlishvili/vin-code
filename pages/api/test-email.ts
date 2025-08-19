// Manual test endpoint for debugging email issues
import { NextApiRequest, NextApiResponse } from 'next'
import generatePDF from '../../lib/generatePDF'
import { sendMail } from '../../lib/mail'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, vincode = 'TEST123', vendor = 'carfax' } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    console.log('[EMAIL_TEST] Starting email test:', { email, vincode, vendor })

    // Create a simple test HTML for PDF generation
    const testHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Test Vehicle Report</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .logo { width: 150px; height: auto; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Test Vehicle History Report</h1>
              <img src="https://www.carfax.com/images/carfax_logo.png" alt="CARFAX Logo" class="logo">
          </div>
          <div class="content">
              <h2>Vehicle Information</h2>
              <p><strong>VIN:</strong> ${vincode}</p>
              <p><strong>Provider:</strong> ${vendor.toUpperCase()}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              
              <h3>Test Report Content</h3>
              <p>This is a test PDF report generated to verify the email functionality.</p>
              
              <h3>Images Test</h3>
              <img src="https://example.com/test-image.jpg" alt="Test Image" style="width: 100px;">
              <img src="https://static.carfax.com/images/badge.png" alt="Badge" style="width: 80px;">
              
              <p><em>Generated on ${new Date().toISOString()}</em></p>
          </div>
      </body>
      </html>
    `

    console.log('[EMAIL_TEST] Generating PDF from test HTML...')
    const pdfBuffer = await generatePDF(testHTML)

    console.log(
      '[EMAIL_TEST] PDF generated successfully, size:',
      pdfBuffer.length,
      'bytes'
    )

    console.log('[EMAIL_TEST] Sending test email to:', email)
    await sendMail(email, vincode, vendor, pdfBuffer)

    console.log('[EMAIL_TEST] Email sent successfully!')

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        email,
        vincode,
        vendor,
        pdfSize: pdfBuffer.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[EMAIL_TEST] Error:', error)

    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
