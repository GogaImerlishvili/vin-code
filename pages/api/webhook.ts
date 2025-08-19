import { NextApiRequest, NextApiResponse } from 'next'
import {
  deleteDocumentById,
  updateSentMail,
  getDocumentById
} from '../../lib/firestore'
import getVinInfo from '../../lib/get-vin-info'
import generatePDF from '../../lib/generatePDF'
import { sendMail } from '../../lib/mail'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // Log all incoming requests for debugging
  console.log('[WEBHOOK] Request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  })

  if (req.method === 'POST') {
    const { PaymentStatus, PaymentId } = req.body

    console.log('[WEBHOOK] Processing payment:', { PaymentStatus, PaymentId })

    switch (PaymentStatus) {
      case 'Timeout':
      case 'Rejected':
        console.log('[WEBHOOK] Payment failed, deleting document:', PaymentId)
        await deleteDocumentById(PaymentId)
        res.status(200).send({})
        break
      case 'Captured':
        console.log('[WEBHOOK] Payment captured, processing email...')
        try {
          const doc = await getDocumentById(PaymentId)
          
          // Check if document exists
          if (!doc) {
            console.log('[WEBHOOK] Document not found for PaymentId:', PaymentId)
            res.status(404).json({ error: 'Document not found', paymentId: PaymentId })
            return
          }
          
          console.log('[WEBHOOK] Document retrieved:', {
            vincode: doc.vincode,
            vendor: doc.vendor,
            mail: doc.mail
          })

          const data = await getVinInfo(doc.vincode, doc.vendor)
          console.log('[WEBHOOK] VIN data retrieved, generating PDF...')

          let pdfBuffer

          if (doc.vendor === 'carfax') {
            pdfBuffer = await generatePDF(data.carfax_data)
          } else if (doc.vendor === 'autocheck') {
            pdfBuffer = await generatePDF(data.autocheck_data)
          }

          console.log(
            '[WEBHOOK] PDF generated, size:',
            pdfBuffer?.length,
            'bytes'
          )

          console.log('[WEBHOOK] Sending email to:', doc.mail)
          await sendMail(doc.mail, doc.vincode, doc.vendor, pdfBuffer)

          console.log('[WEBHOOK] Email sent successfully, updating database...')
          await updateSentMail(PaymentId)

          console.log(
            '[WEBHOOK] Process completed successfully for PaymentId:',
            PaymentId
          )
          res
            .status(200)
            .json({ success: true, message: 'Email sent successfully' })
        } catch (err) {
          console.error('[WEBHOOK] Error processing payment:', err)
          console.error('[WEBHOOK] Error details:', {
            message: err.message,
            stack: err.stack,
            paymentId: PaymentId
          })
          res
            .status(500)
            .json({ error: 'Failed to process payment', details: err.message })
        }
        break
      default:
        console.log('[WEBHOOK] Unknown payment status:', PaymentStatus)
        res.status(200).send({})
        break
    }
  } else {
    console.log('[WEBHOOK] Method not allowed:', req.method)
    res.status(405).json({ msg: 'Method Not Allowed' })
  }
}

export const config = {
  api: {
    externalResolver: true
  }
}
