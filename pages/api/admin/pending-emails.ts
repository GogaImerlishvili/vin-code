// API endpoint for admin to get pending emails
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllPendingDocuments } from '../../../lib/firestore'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[ADMIN_PENDING] Getting all pending documents...')
    const documents = await getAllPendingDocuments()

    console.log(`[ADMIN_PENDING] Found ${documents.length} pending documents`)

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents
    })
  } catch (error) {
    console.error('[ADMIN_PENDING] Error getting pending documents:', error)

    return res.status(500).json({
      error: 'Failed to get pending documents',
      details: error.message
    })
  }
}
