// Alternative API endpoint to process payment success manually
import { NextApiRequest, NextApiResponse } from 'next'
import {
  updateSentMail,
  getDocumentById,
  getDocumentsByEmail
} from '../../lib/firestore'
import getVinInfo from '../../lib/get-vin-info'
import generatePDF from '../../lib/generatePDF'
import { sendMail } from '../../lib/mail'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { paymentId, email, vincode } = req.body

  console.log('[MANUAL_PROCESS] Processing payment success manually:', {
    paymentId,
    email,
    vincode,
    timestamp: new Date().toISOString()
  })

  try {
    let doc

    // Try to find by paymentId first
    if (paymentId) {
      try {
        doc = await getDocumentById(paymentId)
        console.log('[MANUAL_PROCESS] Document found by paymentId:', doc)
      } catch (error) {
        console.log(
          '[MANUAL_PROCESS] No document found with paymentId:',
          paymentId
        )
      }
    }

    // If not found by paymentId, try to find by email and vincode
    if (!doc && email && vincode) {
      console.log('[MANUAL_PROCESS] Searching by email and vincode...')
      const docs = await getDocumentsByEmail(email)
      doc = docs.find((d) => d.vincode === vincode)
      console.log('[MANUAL_PROCESS] Document found by email/vincode:', doc)
    }

    if (!doc) {
      return res.status(404).json({
        error: 'Document not found',
        searchCriteria: { paymentId, email, vincode }
      })
    }

    // Check if email was already sent
    if (doc.sent_mail) {
      console.log('[MANUAL_PROCESS] Email already sent for this document')
      return res.status(200).json({
        message: 'Email was already sent for this payment',
        alreadySent: true
      })
    }

    console.log(
      '[MANUAL_PROCESS] Getting VIN info for:',
      doc.vincode,
      doc.vendor
    )
    const data = await getVinInfo(doc.vincode, doc.vendor)

    console.log('[MANUAL_PROCESS] Generating PDF...')
    let pdfBuffer
    if (doc.vendor === 'carfax') {
      pdfBuffer = await generatePDF(data.carfax_data)
    } else if (doc.vendor === 'autocheck') {
      pdfBuffer = await generatePDF(data.autocheck_data)
    } else {
      throw new Error(`Unknown vendor: ${doc.vendor}`)
    }

    console.log(
      '[MANUAL_PROCESS] PDF generated, size:',
      pdfBuffer?.length,
      'bytes'
    )

    console.log('[MANUAL_PROCESS] Sending email to:', doc.mail)
    await sendMail(doc.mail, doc.vincode, doc.vendor, pdfBuffer)

    console.log('[MANUAL_PROCESS] Updating database...')
    await updateSentMail(doc.id || paymentId)

    console.log('[MANUAL_PROCESS] Process completed successfully')

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      details: {
        email: doc.mail,
        vincode: doc.vincode,
        vendor: doc.vendor,
        pdfSize: pdfBuffer?.length
      }
    })
  } catch (error) {
    console.error('[MANUAL_PROCESS] Error:', error)

    return res.status(500).json({
      error: 'Failed to process payment success',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
