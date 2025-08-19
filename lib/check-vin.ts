import checkBalance from './balance'
const checkVin = async (
  vincode: string,
  vendor: string,
  retries: number = 0
): Promise<boolean> => {
  try {
    // Check balancee
    const balance = await checkBalance()
    if (!balance) {
      return false
    } else {
      // Use correct endpoint for Carfax
      let endpoint = ''
      if (vendor === 'carfax') {
        endpoint = `/api/v1/carfax/check?vincode=${vincode}&api_key=${process.env.API_KEY}`
      } else if (vendor === 'autocheck') {
        endpoint = `/api/v1/autocheck/check?vincode=${vincode}&api_key=${process.env.API_KEY}`
      } else {
        throw new Error('Unknown vendor')
      }
      const url = `${process.env.API_URL}${endpoint}`
      const response = await fetch(url)
      const statusCode = response.status
      if (!response.ok) throw new Error()
      if (statusCode === 200) return true
      if (statusCode === 404) return false
    }
  } catch (err) {
    if (retries > 0) {
      return checkVin(vincode, vendor, retries - 1)
    } else {
      throw new Error('Maximum retries reached')
    }
  }
}

export default checkVin
