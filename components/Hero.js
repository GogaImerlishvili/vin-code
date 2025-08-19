import React, { useContext } from 'react'
import { Heading, Box, Text, Flex } from '@chakra-ui/react'
import { BsClock } from 'react-icons/bs'
import { LiaCoinsSolid } from 'react-icons/lia'
import { GoShieldCheck } from 'react-icons/go'
import { Lang } from '../context'
import data from '../locales/langs'

const Hero = () => {
  const { lang, setLang } = useContext(Lang)
  let { hero } = data[lang]

  return (
    <Box>
      <Box
        textColor="black"
        display="flex"
        justifyContent="center"
        w={{ base: '90%', md: 'fit-content', lg: 'fit-content' }}
        m="0 auto"
        mt={{ base: '-90px', md: '-150px', lg: '-180px' }}
      >
        <Heading
          mt={'50px'}
          border="1px solid rgba(255,255,255, 0.2)"
          ml="auto"
          mr="auto"
          mb="50px"
          p={{ base: '20px 5px', md: '30px 40px', lg: '30px 40px' }}
          borderRadius="10px"
          color="white"
          fontWeight="light"
          alignItems={'center'}
          fontSize={{ base: '15px', md: '20px', lg: '22px' }}
          textAlign="center"
          backdropFilter="blur(1px)"
          backgroundColor="rgba(255,255,255,.1)"
        >
          {hero['hero-title']}
        </Heading>
      </Box>
      <Box
        display="flex"
        align="center"
        mt={{ base: '10px', md: '50px', lg: '100px' }}
        maxW="1200px"
        ml="auto"
        mr="auto"
        mb="60px"
      >
        <Flex
          w={{ base: '100%', sm: '100%', md: '100%', lg: '100%' }}
          backgroundColor={{
            base: '#3874CB',
            sm: '#3874CB',
            md: 'transparent',
            lg: 'transparent'
          }}
          fontSize={{ base: '70px', md: '95px', lg: '90px' }}
          textColor="white"
          align="center"
          justifyContent="space-evenly"
        >
          <Box
            backgroundColor="#3874CB"
            borderRadius="10px"
            h="200px"
            w={{ base: '30%', md: '200px', lg: '200px' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            ml="auto"
            mr="auto"
          >
            <BsClock />
            <Text fontSize={{ base: '16px', md: '18px', lg: '20px' }} mt="15px">
              {hero['hero-time']}
            </Text>
          </Box>
          <Box
            backgroundColor="#3874CB"
            borderRadius="10px"
            h="200px"
            w={{ base: '30%', md: '200px', lg: '200px' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            ml="auto"
            mr="auto"
          >
            <LiaCoinsSolid style={{ marginLeft: '15px' }} />
            <Text fontSize={{ base: '16px', md: '18px', lg: '20px' }} mt="15px">
              {hero['hero-money']}
            </Text>
          </Box>
          <Box
            backgroundColor="#3874CB"
            borderRadius="10px"
            h="200px"
            w={{ base: '30%', md: '200px', lg: '200px' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            ml="auto"
            mr="auto"
          >
            <GoShieldCheck style={{ marginRight: '5px' }} />
            <Text fontSize={{ base: '16px', md: '18px', lg: '20px' }} mt="15px">
              {hero['hero-protect']}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default Hero
