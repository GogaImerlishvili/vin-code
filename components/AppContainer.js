import Navbar from './Navbar'
import Form from './Form'
import Hero from './Hero'
import Reasons from './Reasons'
import SampleButton from './SampleButton'
import Footer from './Footer'
import { Lang } from '../context'
import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import Head from 'next/head'

const AppContainer = ({ children }) => {
  const [lang, setLang] = useState('en')
  return (
    <Lang.Provider value={{ lang, setLang }}>
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon32.png" />
        <title>Top VIN number lookup!</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        backgroundColor="#F1F4FD"
      >
        <Navbar />
        <Box bg="linear-gradient(336deg, rgba(71, 71, 71, 0.05) 0%, rgba(71, 71, 71, 0.05) 27%,rgba(209, 209, 209, 0.05) 27%, rgba(209, 209, 209, 0.05) 100%),linear-gradient(391deg, rgba(63, 63, 63, 0.05) 0%, rgba(63, 63, 63, 0.05) 43%,rgba(138, 138, 138, 0.05) 43%, rgba(138, 138, 138, 0.05) 100%),linear-gradient(420deg, rgba(58, 58, 58, 0.05) 0%, rgba(58, 58, 58, 0.05) 24%,rgba(100, 100, 100, 0.05) 24%, rgba(100, 100, 100, 0.05) 100%),linear-gradient(333deg, rgba(47, 47, 47, 0.05) 0%, rgba(47, 47, 47, 0.05) 45%,rgba(208, 208, 208, 0.05) 45%, rgba(208, 208, 208, 0.05) 100%),linear-gradient(187deg, rgb(18,25,55),rgb(18,25,55))">
          <Form />
          <Hero />
          <Reasons />
          <SampleButton />
        </Box>
        <Footer />
        {children}
      </Box>
    </Lang.Provider>
  )
}

export default AppContainer
