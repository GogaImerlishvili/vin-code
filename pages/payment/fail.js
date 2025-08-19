// pages/payment/fail.js
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function PaymentFail() {
  return (
    <Box
      minH="60vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Heading color="red.500" mb={4}>
        გადახდა წარუმატებელია
      </Heading>
      <Text mb={6}>გთხოვთ, სცადეთ თავიდან ან დაუკავშირდით მხარდაჭერას.</Text>
      <Link href="/" passHref>
        <Button colorScheme="blue">მთავარ გვერდზე დაბრუნება</Button>
      </Link>
    </Box>
  )
}
