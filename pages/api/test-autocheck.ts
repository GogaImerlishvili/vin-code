// AutoCheck API Test Endpoint
import { NextApiRequest, NextApiResponse } from 'next'
import { getEnvVar } from '../../lib/getEnvVar'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vin = '1HGBH41JXMN109186' } = req.query

  try {
    console.log('[AUTOCHECK_TEST] Testing AutoCheck API with VIN:', vin)

    const apiUrl = getEnvVar('API_URL')
    const apiKey = getEnvVar('API_KEY')

    const testUrl = `${apiUrl}/api/v1/autocheck?vincode=${vin}&api_key=${apiKey}`
    console.log(
      '[AUTOCHECK_TEST] Test URL (без API key):',
      `${apiUrl}/api/v1/autocheck?vincode=${vin}&api_key=***`
    )

    const startTime = Date.now()
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AutoVin-Test-Client/1.0'
      }
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    console.log('[AUTOCHECK_TEST] Response status:', response.status)
    console.log('[AUTOCHECK_TEST] Response time:', responseTime + 'ms')

    const responseText = await response.text()
    console.log('[AUTOCHECK_TEST] Raw response:', responseText)

    let parsedData
    try {
      parsedData = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('[AUTOCHECK_TEST] JSON parsing error:', jsonError)
      return res.status(500).json({
        error: 'Invalid JSON response',
        status: response.status,
        rawResponse: responseText,
        responseTime: responseTime
      })
    }

    // Response analysis
    const analysis = {
      hasData: !!parsedData,
      hasAutocheckData: !!parsedData?.autocheck_data,
      dataKeys: parsedData ? Object.keys(parsedData) : [],
      dataSize: JSON.stringify(parsedData).length
    }

    console.log('[AUTOCHECK_TEST] Response analysis:', analysis)

    return res.status(200).json({
      success: true,
      testInfo: {
        vin: vin,
        apiUrl: `${apiUrl}/api/v1/autocheck`,
        responseTime: responseTime + 'ms',
        status: response.status,
        timestamp: new Date().toISOString()
      },
      analysis: analysis,
      data: parsedData,
      rawResponse:
        responseText.substring(0, 1000) +
        (responseText.length > 1000 ? '...' : '')
    })
  } catch (error) {
    console.error('[AUTOCHECK_TEST] Error:', error)

    return res.status(500).json({
      error: 'AutoCheck API test failed',
      details: error.message,
      testUrl: `${getEnvVar(
        'API_URL'
      )}/api/v1/autocheck?vincode=${vin}&api_key=***`,
      timestamp: new Date().toISOString()
    })
  }
}
