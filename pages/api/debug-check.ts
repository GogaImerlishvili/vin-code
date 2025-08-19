import { NextApiRequest, NextApiResponse } from 'next'
import getVinInfo from '../../lib/get-vin-info'
import generatePDF from '../../lib/generatePDF'
import { sendMail } from '../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[DEBUG-CHECK] Request received:', {
    method: req.method,
    body: req.body,
    query: req.query
  })

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { vincode, vendor, email } = req.body

    console.log('[DEBUG-CHECK] Processing:', { vincode, vendor, email })

    // 1. Test VIN API
    console.log('[DEBUG-CHECK] Step 1: Getting VIN info...')
    const data = await getVinInfo(vincode, vendor)
    console.log('[DEBUG-CHECK] VIN data received successfully')

    // 2. Test PDF Generation
    console.log('[DEBUG-CHECK] Step 2: Generating PDF...')
    let pdfBuffer
    if (vendor === 'carfax') {
      pdfBuffer = await generatePDF(data.carfax_data)
    } else if (vendor === 'autocheck') {
      pdfBuffer = await generatePDF(data.autocheck_data)
    }
    console.log('[DEBUG-CHECK] PDF generated, size:', pdfBuffer?.length, 'bytes')

    // 3. Test Email Sending
    console.log('[DEBUG-CHECK] Step 3: Sending email...')
    await sendMail(email, vincode, vendor, pdfBuffer)
    console.log('[DEBUG-CHECK] Email sent successfully!')

    res.status(200).json({
      success: true,
      message: 'Debug check completed successfully',
      steps: {
        vinApi: 'OK',
        pdfGeneration: 'OK',
        emailSent: 'OK'
      },
      pdfSize: pdfBuffer?.length
    })

  } catch (error) {
    console.error('[DEBUG-CHECK] Error:', error)
    res.status(500).json({
      error: 'Debug check failed',
      message: error.message,
      step: 'Unknown'
    })
  }
}
