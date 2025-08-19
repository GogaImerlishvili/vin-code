import { getTransactionURL } from '../../lib/payment'
import { NextApiRequest, NextApiResponse } from 'next'
import { getEnvVar } from '../../lib/getEnvVar'

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === 'POST') {
//     const { vincode, mail, vendor } = req.body

//     // Input validation
//     if (
//       !vincode ||
//       typeof vincode !== 'string' ||
//       vincode.length !== 17 ||
//       !mail ||
//       typeof mail !== 'string' ||
//       !vendor ||
//       typeof vendor !== 'string'
//     ) {
//       return res.status(400).json({ msg: 'Invalid input' })
//     }

//     let price: number
//     try {
//       price = Number(getEnvVar(`${vendor.toUpperCase()}_PRICE`))
//       if (isNaN(price)) throw new Error('Invalid price')
//     } catch (e) {
//       return res.status(400).json({ msg: 'Invalid vendor or price config' })
//     }

//     try {
//       const response = await getTransactionURL(vincode, mail, price, vendor)
//       res.status(200).send(response)
//     } catch (err) {
//       res.status(400).send({ msg: 'error' })
//     }
//   }
// }
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { vincode, mail, vendor } = req.body
    console.log('Received:', { vincode, mail, vendor })

    if (
      !vincode ||
      typeof vincode !== 'string' ||
      vincode.length !== 17 ||
      !mail ||
      typeof mail !== 'string' ||
      !vendor ||
      typeof vendor !== 'string'
    ) {
      return res.status(400).json({ msg: 'Invalid input' })
    }

    let price: number
    try {
      console.log('Fetching price for vendor:', vendor, req.body)
      price = Number(getEnvVar(`NEXT_PUBLIC_${vendor.toUpperCase()}_PRICE`))
      if (isNaN(price)) throw new Error('Invalid price')
    } catch (e) {
      console.log('Error fetching price:', e)
      return res.status(400).json({ msg: 'Invalid vendor or price config' })
    }

    try {
      const response = await getTransactionURL(vincode, mail, price, vendor)
      res.status(200).json({ response })
    } catch (err) {
      res
        .status(400)
        .json({ msg: err instanceof Error ? err.message : 'error' })
    }
  } else {
    res.status(405).json({ msg: 'Method Not Allowed' })
  }
}
