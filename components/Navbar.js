import React, { useContext } from 'react'
import { Image, Box, Link, Select } from '@chakra-ui/react'
import { Lang } from '../context'
import data from '../locales/langs'


const selectResponsiveStyle = {
  width: 'fit-content',
  cursor: 'pointer',
  transition: 'width 0.2s',
};

const mediaQuery = `@media (max-width: 600px) {
  .navbar-logo {
    width: 140px !important;
    height: 140px !important;
    margin-top: 10px !important;
  }
  .navbar-select {
    width: 80px !important;
    font-size: 14px !important;
  }
}`;

const Navbar = () => {
  const { lang, setLang } = useContext(Lang)
  let { title } = data[lang]

  const handleChange = (e) => {
    setLang(e.target.value)
  }
  // Inject responsive styles
  if (typeof window !== 'undefined') {
    const styleTag = document.getElementById('navbar-responsive-style');
    if (!styleTag) {
      const style = document.createElement('style');
      style.id = 'navbar-responsive-style';
      style.innerHTML = mediaQuery;
      document.head.appendChild(style);
    }
  }
  return (
    <Box
      textColor="white"
      display="flex"
      maxW="full"
      h="100px"
      bg="#3874CB"
      style={{ background: '#3874CB', boxShadow: '0 8px 24px 0 rgba(13,46,73,0.7)' }}
    >
      <Box
        display="flex"
        justifyContent={'space-between'}
        alignItems="center"
        w="1400px"
        m="0 auto"
      >
        <Box>
           <Link href="/">
             <Box display="flex" position="relative" style={{ minWidth: '120px', minHeight: '120px', justifyContent: 'center', alignItems: 'center' }}>
               <Image
                 src="/final-logo-v.svg"
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
        <Box mr="52px">
          <Select
            onChange={(e) => handleChange(e)}
            display={'flex'}
            justifyContent="flex-end"
            className="navbar-select"
            style={selectResponsiveStyle}
            marginRight={{ base: '20px', md: '52px' }}
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
