import { NextApiRequest, NextApiResponse } from 'next'
import getVinInfo from '../../lib/get-vin-info'
import generatePDF from '../../lib/generatePDF'
import { sendMail } from '../../lib/mail'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vin, vendor, email } = req.query
  try {
    const data = await getVinInfo(vin as string, vendor as string)
    const pdfBuffer = await generatePDF(
      vendor === 'carfax' ? data.carfax_data : data.autocheck_data
    )
    await sendMail(email as string, vin as string, vendor as string, pdfBuffer)
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err })
  }
}
