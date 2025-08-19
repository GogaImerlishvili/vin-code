import axios from 'axios'
export async function getBogAccessToken() {
  const clientId = process.env.BOG_CLIENT_ID
  const clientSecret = process.env.BOG_CLIENT_SECRET
  const tokenUrl =
    'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token'

  if (!clientId || !clientSecret) {
    console.error(
      'Missing BOG_CLIENT_ID or BOG_CLIENT_SECRET in environment variables.'
    )
    throw new Error('BOG credentials are not set in environment variables')
  }

  console.log('Fetching BOG access token with client ID:', clientId)
  console.log('clientSecret:', clientSecret)
  console.log('Using token URL:', tokenUrl)
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', clientId)
  params.append('client_secret', clientSecret)

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if (!response.data || !response.data.access_token) {
      console.error('BOG token response missing access_token:', response.data)
      throw new Error('BOG token response missing access_token')
    }
    return response.data.access_token
  } catch (err) {
    if (err.response) {
      console.error('BOG token error:', err.response.data)
      throw new Error(
        'Failed to get BOG access token: ' +
          (err.response.data?.error_description ||
            err.response.data?.error ||
            err.response.statusText ||
            'Unknown error')
      )
    } else {
      console.error('BOG token error:', err)
      throw new Error(
        'Failed to get BOG access token: ' + (err.message || 'Unknown error')
      )
    }
  }
}
