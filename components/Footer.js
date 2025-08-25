import React, { useContext } from 'react'
import { Box, Link, Image, Text } from '@chakra-ui/react'
import { Lang } from '../context'
import data from '../locales/langs'

const Footer = () => {
  const { lang, setLang } = useContext(Lang)
  let { title } = data[lang]
  return (
    <>
      <Box
        mt="auto"
        h={['150px', '150px', '150px']}
        bg="#3874CB"
        maxW="full"
        display="flex"
        flexDirection="row"
      >
        <Box
          w="1400px"
          m="auto"
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Box maxW="300px" m="auto 0">
            <Box display="flex" position="relative">
              <Link href="/">
                <Box
                  display="flex"
                  position="relative"
                  style={{
                    minWidth: '120px',
                    minHeight: '120px',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={{ base: '100px', md: '120px' }}
                    height={{ base: '100px', md: '120px' }}
                    objectFit="contain"
                    marginTop={{ base: '10px', md: '20px' }}
                    marginLeft={{ base: '12px', md: '0px' }}
                    cursor="pointer"
                  />
                </Box>
              </Link>
            </Box>
          </Box>
          <Box
            ml={['50px', '4rem', '4rem']}
            display="flex"
            flexDirection="column"
            h="70px"
          >
            <Box display="flex" alignItems="center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1.5em"
                viewBox="0 0 512 512"
                fill="white"
              >
                <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
              </svg>
              <Link
                href="/"
                fontSize={{ base: '14px', md: '15px', lg: '16px' }}
                ml="10px"
                textColor="white"
                mt="5px"
              >
                info@myautovin.ge
              </Link>
            </Box>

            <Box display="flex" alignItems="center" mt="5px">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1.5em"
                viewBox="0 0 496 512"
                fill="white"
              >
                <path d="M248 8C111 8 0 119 0 256c0 137 111 248 248 248s248-111 248-248C496 119 385 8 248 8zm104.6 148.5l-36.7 173.7c-2.8 12.6-10.2 15.7-20.6 9.8l-57-42.1-27.5 26.5c-3 3-5.5 5.5-11.2 5.5l4-56.6 103.1-93c4.5-4-1-6.2-7-2.2l-127.6 80.2-55-17.2c-12-3.7-12.2-12-2.5-15.8l215.2-83.1c9.9-3.7 18.6 2.4 15.1 15.7z" />
              </svg>
              <Link
                href="https://t.me/autovinge"
                isExternal
                fontSize={{ base: '14px', md: '15px', lg: '16px' }}
                ml="10px"
                textColor="white"
                mt="2px"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Telegram: @autovinge
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        color="white"
           bg="#3874CB"
        pb="10px"
        display="flex"
        flexDirection="row"
        fontSize="13px"
      >
        <Text
          textAlign={['center', 'end', 'end']}
          w="50%"
          mr={['5px', '40px', '40px']}
          textColor="white"
        >
          Copyright &copy; 2025
        </Text>
        <Text textAlign={['center', 'start', 'start']} w="50%" textColor="white">
          All rights reserved
        </Text>
      </Box>
    </>
  )
}

export default Footer
