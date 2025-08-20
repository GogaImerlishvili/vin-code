
import { getEnvVar } from './getEnvVar'

// Simple in-memory cache for VIN info (per process)
const vinInfoCache: Record<string, any> = {}

const getVinInfo = async (
  vincode: string,
  vendor: string,
  retries: number = 3
) => {
  // Helper to log errors with retry count
  function logRetryError(error: any, attempt: number) {
    console.error(
      `getVinInfo: შეცდომა ცდაზე #${attempt}:`,
      error?.message || error
    )
  }

  // Compose cache key
  const cacheKey = `${vendor}:${vincode}`
  if (vinInfoCache[cacheKey]) {
    console.log('getVinInfo: დაბრუნდა cache-დან:', cacheKey)
    return vinInfoCache[cacheKey]
  }

  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${getEnvVar(
        'API_URL'
      )}/api/v1/${vendor}?vincode=${vincode}&api_key=${getEnvVar('API_KEY')}`
      console.log('getVinInfo: ვაგზავნით მოთხოვნას:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getEnvVar('API_KEY')}`,
          'Content-Type': 'application/json'
        }
      })
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (jsonError) {
        console.error(
          'getVinInfo: JSON parsing error. Status:',
          response.status,
          'Text:',
          text
        )
        throw new Error(
          `JSON parsing error. Status: ${response.status}. Text: ${text}`
        )
      }
      // Save to cache
      vinInfoCache[cacheKey] = data
      return data
    } catch (error) {
      logRetryError(error, attempt)
      lastError = error
      if (attempt === retries) {
        console.error('getVinInfo: ყველა ცდა ამოიწურა.')
        throw new Error('Maximum retries reached')
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw lastError
}
export default getVinInfo
