import { getEnvVar } from './getEnvVar'

const checkBalance = async (retries: number = 0): Promise<boolean> => {
  try {
    const url = `${getEnvVar(
      'API_URL'
    )}/api/v1/carfax/balance?api_key=${getEnvVar('API_KEY')}`
    const response = await fetch(url)
    const balanceData = await response.json()
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    // The API returns { message: "363.8" }
    const balance = parseFloat(balanceData.message)
    if (isNaN(balance)) throw new Error('Invalid balance value')

    return balance >= 3
  } catch (err) {
    console.error('checkBalance error:', err)
    if (retries > 0) {
      return checkBalance(retries - 1)
    } else {
      throw new Error('Maximum retries reached')
    }
  }
}

export default checkBalance
