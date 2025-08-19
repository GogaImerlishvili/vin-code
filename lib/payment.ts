import { addDocument } from './firestore'
import { getEnvVar } from './getEnvVar'
import { getBogAccessToken } from './bogAuth'
import crypto from 'crypto'

const getTransactionURL = async (
  vincode: string,
  mail: string,
  amount: number,
  vendor: string,
  tries: number = 3
) => {
  try {
    // Get fresh OAuth token from BOG
    const accessToken = await getBogAccessToken()
    console.log('BOG access token:', accessToken)
    // Construct the payload as required by BOG's API (ecommerce/orders)
    const externalOrderId = crypto.randomUUID()
    const payload = {
      callback_url: getEnvVar('BOG_CALLBACK_URL'),
      external_order_id: externalOrderId,
      purchase_units: {
        currency: 'GEL',
        total_amount: amount,
        basket: [
          {
            quantity: 1,
            unit_price: amount,
            product_id: vincode
          }
        ]
      },
      redirect_urls: {
        fail: getEnvVar('BOG_FAIL_URL') || getEnvVar('BOG_RETURN_URL'),
        success: getEnvVar('BOG_SUCCESS_URL') || getEnvVar('BOG_RETURN_URL')
      }
    }
    console.log('BOG payment payload:', payload)

    // Generate a unique correlation ID for this request
    const correlationId = crypto.randomUUID()

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'accept-language': 'ka',
        Authorization: `Bearer ${accessToken}`,
        'x-correlationid': correlationId
      },
      body: JSON.stringify(payload)
    }

    // Use the fixed BOG payment endpoint for ecommerce/orders
    const paymentEndpoint = 'https://api.bog.ge/payments/v1/ecommerce/orders'
    console.log('BOG payment endpoint:', paymentEndpoint)

    const res = await fetch(paymentEndpoint, options)

    // Log raw response for debugging
    const rawText = await res.text()
    console.log('BOG raw response:', res.status, rawText)

    // Check for HTTP errors before parsing JSON
    if (!res.ok) {
      // Try to parse error as JSON, otherwise show raw text
      try {
        const errorJson = JSON.parse(rawText)
        console.error('BOG API error:', res.status, errorJson)
        throw new Error(
          `BOG API error: ${res.status} - ${JSON.stringify(errorJson)}`
        )
      } catch {
        console.error('BOG API error:', res.status, rawText)
        throw new Error(`BOG API error: ${res.status} - ${rawText}`)
      }
    }

    // Try to parse JSON only if response is ok
    let response
    try {
      response = JSON.parse(rawText)
    } catch (e) {
      console.error('Failed to parse BOG response as JSON:', rawText)
      throw new SyntaxError('BOG response is not valid JSON')
    }

    // Store the correlation ID for troubleshooting
    const responseCorrelationId = res.headers.get('x-correlationid')
    if (responseCorrelationId) {
      console.log('BOG x-correlationid:', responseCorrelationId)
    }

    if (!response) throw new Error('No response from BOG API')

    // Use the already generated external_order_id as the primary identifier for Firestore  
    const transactionId = externalOrderId // This will be used for Firestore
    
    console.log('Using external_order_id for Firestore:', externalOrderId)
    let transactionUrl =
      (response._links &&
        response._links.redirect &&
        response._links.redirect.href) ||
      response.redirectUrl ||
      response.transactionUrl ||
      response.url
    await addDocument(transactionId, mail, vincode, vendor)

    // Return transactionUrl for frontend redirect
    return {
      transactionUrl,
      transactionId,
      correlationId: responseCorrelationId,
      raw: response
    }
  } catch (err) {
    console.error('Error fetching transaction URL:', err)
    if (tries > 0) {
      return getTransactionURL(vincode, mail, amount, vendor, tries - 1)
    }
    throw new Error('Could not get transaction url')
  }
}

export { getTransactionURL }
