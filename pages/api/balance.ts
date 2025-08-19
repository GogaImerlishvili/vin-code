import checkBalance from '../../lib/balance'
import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const response = await checkBalance()
      console.log(response)
      if (!response) return res.status(404).json({ msg: 'no balance' })
      return res.status(200).json(response)
    } catch (err) {
      return res.status(400).json({ msg: 'error' })
    }
  }
}
