import { ChakraProvider } from '@chakra-ui/react'
import AppContainer from '../components/AppContainer'
import theme from '../config/theme'
import { useEffect } from 'react'
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {}
      // window.Tawk_API.lang = 'ka';
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://embed.tawk.to/68b4810dd258c126a9008648/1j40hg7c5'
      script.charset = 'UTF-8'
      script.setAttribute('crossorigin', '*')
      document.body.appendChild(script)
    }
  }, [])
  return (
    <ChakraProvider theme={theme}>
      <AppContainer>
        <Component {...pageProps} />
      </AppContainer>
    </ChakraProvider>
  )
}

export default MyApp
