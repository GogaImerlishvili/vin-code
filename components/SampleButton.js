import React, { useContext } from 'react'
import { Button, Box, Link } from '@chakra-ui/react'
import { Lang } from '../context'
import data from '../locales/langs'

const SampleButton = () => {
  const { lang, setLang } = useContext(Lang)
  let { sample } = data[lang]
  return (
    <Box display="flex" justifyContent="center" mt="80px" mb="200px">
      <Link
        href="/Sample.pdf"
        target="_blank"
        bg="blue.500"
        color="white"
        p="1.5rem 1rem"
        m="-10px auto 40px auto"
        mb="40px"
        mt="-10px"
        w={[300, 400, 450]}
        borderRadius="2xl"
        textAlign="center"
        fontWeight="thiner"
        fontSize={{ base: '18px', md: '20px', lg: '25px' }}
      >
        {sample}
      </Link>
    </Box>
  )
}

export default SampleButton
