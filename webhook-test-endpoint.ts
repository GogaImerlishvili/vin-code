// Add this to pages/api/webhook-test.ts for debugging

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[WEBHOOK-TEST] Method:', req.method)
  console.log('[WEBHOOK-TEST] Headers:', JSON.stringify(req.headers, null, 2))
  console.log('[WEBHOOK-TEST] Body:', JSON.stringify(req.body, null, 2))
  console.log('[WEBHOOK-TEST] Query:', JSON.stringify(req.query, null, 2))
  console.log('[WEBHOOK-TEST] URL:', req.url)
  
  // Return success with received data
  res.status(200).json({
    message: 'Webhook test received successfully',
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  })
}
