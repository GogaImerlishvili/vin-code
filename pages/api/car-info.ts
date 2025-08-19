import { NextApiRequest, NextApiResponse } from 'next'
import {
  validateMail,
  validateVendor,
  validateVincode
} from '../../lib/validate'
import checkVin from '../../lib/check-vin'

interface customNextApiRequest extends NextApiRequest {
  query: {
    vendor: string
    vincode: string
    receiver: string
  }
}

export default async function handler(
  req: customNextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { vendor, vincode, receiver } = req.query
    const condArray = [
      validateMail(receiver),
      validateVendor(vendor),
      validateVincode(vincode)
    ]

    if (!condArray.includes(false)) {
      try {
        const reportFound = await checkVin(vincode, vendor)
        res.status(200).json({ vendor, vincode, receiver, reportFound })
      } catch (err) {
        res.status(500).json({
          msg: 'Server error',
          error: err instanceof Error ? err.message : err
        })
      }
    } else {
      res.status(400).json({ msg: 'Invalid input' })
    }
  } else {
    res.status(405).json({ msg: 'Method Not Allowed' })
  }
}
