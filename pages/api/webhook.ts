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
    // Handle different webhook formats
    let PaymentStatus, PaymentId
    
    // BOG webhook format
    if (req.body.event === 'order_payment') {
      const orderData = req.body.body
      PaymentId = orderData.external_order_id
      
      // Map BOG status to our expected format
      if (orderData.order_status && orderData.order_status.key) {
        const bogStatus = orderData.order_status.key
        switch (bogStatus) {
          case 'created':
          case 'pending':
            PaymentStatus = 'Pending'
            break
          case 'succeeded':
          case 'completed':
            PaymentStatus = 'Captured'
            break
          case 'failed':
          case 'cancelled':
            PaymentStatus = 'Rejected'
            break
          case 'expired':
            PaymentStatus = 'Timeout'
            break
          default:
            PaymentStatus = bogStatus
        }
      }
      
      console.log('[WEBHOOK] BOG format detected:', {
        bogOrderId: orderData.order_id,
        externalOrderId: orderData.external_order_id,
        bogStatus: orderData.order_status?.key,
        mappedStatus: PaymentStatus
      })
    } else {
      // Legacy format
      PaymentStatus = req.body.PaymentStatus
      PaymentId = req.body.PaymentId
    }

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

          // Protection against duplicate processing

          // Protection against duplicate and parallel processing
          if (doc.sent_mail) {
            console.log('[WEBHOOK] Email already sent for this PaymentId:', PaymentId)
            res.status(200).json({ message: 'Email already sent', alreadySent: true })
            return
          }
          if (doc.processing) {
            console.log('[WEBHOOK] Processing already in progress for PaymentId:', PaymentId)
            res.status(200).json({ message: 'Processing already in progress', alreadyProcessing: true })
            return
          }
          // Set processing flag
          await require('../../lib/firestore').setProcessing(PaymentId)

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
