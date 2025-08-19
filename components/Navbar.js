import React, { useContext } from 'react'
import { Image, Box, Link, Select } from '@chakra-ui/react'
import { Lang } from '../context'
import data from '../locales/langs'

const Navbar = () => {
  const { lang, setLang } = useContext(Lang)
  let { title } = data[lang]

  const handleChange = (e) => {
    setLang(e.target.value)
  }
  return (
    <Box textColor="white" display="flex" maxW="full" h="100px" bg="#2D5697">
      <Box
        display="flex"
        justifyContent={'space-between'}
        alignItems="center"
        w="1400px"
        m="0 auto"
      >
        <Box>
          <Box display="flex" position="relative">
            <Image
              src="/circle.svg"
              position="absolute"
              top="-24px"
              left="36px"
              h="65px"
              alt="Logo"
            />
            <Link
              mt="-4px"
              ml={'55px'}
              fontSize={'2md'}
              href="/"
              textColor="white"
            >
              MYAUTOVIN
            </Link>
          </Box>
        </Box>
        <Box mr="52px">
          <Select
            onChange={(e) => handleChange(e)}
            display={'flex'}
            justifyContent="flex-end"
            width="fit-content"
            cursor="pointer"
          >
            <option value="en">EN</option>
            <option value="ka">KA</option>
          </Select>
        </Box>
      </Box>
    </Box>
  )
}

export default Navbar
