import { getEnvVar } from './getEnvVar'
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(getEnvVar('SENDGRID_API_KEY'))

export const sendMail = async (
  mail: string,
  vincode: string,
  vendor: string,
  pdfBuffer: Buffer,
  tries: number = 3
) => {
  // PDF validation
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('PDF buffer is empty')
  }

  if (!Buffer.isBuffer(pdfBuffer)) {
    console.warn('[sendMail] ⚠️ pdfBuffer is not a Buffer, converting...')
    pdfBuffer = Buffer.from(pdfBuffer)
  }

  if (pdfBuffer.length < 1000) {
    throw new Error('PDF buffer is too small, likely corrupted')
  }

  // შევამოწმოთ PDF header
  const pdfHeader = pdfBuffer.slice(0, 4).toString()
  if (pdfHeader !== '%PDF') {
    console.warn(
      '[sendMail] ⚠️ PDF header validation failed, but continuing...'
    )
  } else {
    console.log(
      `[sendMail] ✅ PDF validation passed. Size: ${pdfBuffer.length} bytes`
    )
  }

  // Convert PDF to base64 properly
  const base64Content = pdfBuffer.toString('base64')
  console.log(`[sendMail] Base64 content length: ${base64Content.length}`)
  console.log(`[sendMail] Base64 sample: ${base64Content.substring(0, 50)}...`)

  const msg = {
    to: mail,
    from: {
      email: 'autovin2023@gmail.com',
      name: `${vendor} Report Service`
    },
    replyTo: mail,
    subject: `${vendor.toUpperCase()} Vehicle Report - ${vincode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Vehicle Report Ready</h2>
        <p>Your <strong>${vendor.toUpperCase()}</strong> report for vehicle <strong>${vincode}</strong> is attached.</p>
        <p>Please find the detailed report in the PDF attachment.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Vehicle Report Service.<br>
          If you did not request this report, please ignore this email.
        </p>
      </div>
    `,
    attachments: [
      {
        content: base64Content,
        filename: `${vendor}-report-${vincode}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  }

  try {
    console.log('[sendMail] Attempting to send email to:', mail)
    const result = await sgMail.send(msg)
    console.log('[sendMail] Email sent successfully:', result)
    return result
  } catch (err) {
    console.error('[sendMail] Error sending email:', {
      error: err.message,
      code: err.code,
      response: err.response?.body,
      responseStatus: err.response?.status,
      responseHeaders: err.response?.headers,
      mail: mail,
      tries: tries,
      fullError: JSON.stringify(err.response?.body, null, 2)
    })

    if (tries > 0) {
      console.log(`[sendMail] Retrying... ${tries} attempts left`)
      return sendMail(mail, vincode, vendor, pdfBuffer, tries - 1)
    } else {
      throw new Error(
        `Could not send mail: ${err.message}. Details: ${JSON.stringify(
          err.response?.body
        )}`
      )
    }
  }
}
