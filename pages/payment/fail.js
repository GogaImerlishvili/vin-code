// pages/payment/fail.js
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function PaymentFail() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ background: 'rgb(13, 46, 73)' }}
    >
      <Heading color="red.500" mb={4} fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
        გადახდა წარუმატებელია
      </Heading>
      <Text mb={6} fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} textAlign={{ base: 'center', md: 'left' }}>
        გთხოვთ, სცადეთ თავიდან ან დაუკავშირდით მხარდაჭერას.
      </Text>
      <Link href="/" passHref>
        <Button colorScheme="blue">მთავარ გვერდზე დაბრუნება</Button>
      </Link>
    </Box>
  )
}
