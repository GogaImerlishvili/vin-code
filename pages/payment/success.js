// pages/payment/success.js
import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  VStack
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function PaymentSuccess() {
  const router = useRouter()
  const [emailStatus, setEmailStatus] = useState('checking') // checking, sent, failed, already_sent
  const [errorMessage, setErrorMessage] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)

  const { paymentId, email, vincode, vendor } = router.query

  const processPaymentSuccess = async (retryCount = 0) => {
    try {
      setEmailStatus('checking')
      console.log('Processing payment success:', { paymentId, email, vincode })

      const response = await fetch('/api/process-payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          email,
          vincode,
          vendor
        })
      })
      const data = await response.json()

      if (response.ok) {
        if (data.alreadySent) {
          setEmailStatus('already_sent')
        } else {
          setEmailStatus('sent')
        }
        // Mark as processed in localStorage
        if (paymentId) {
          localStorage.setItem(`payment_processed_${paymentId}`, 'true')
        }
      } else {
        console.error('Failed to process payment:', data)
        setEmailStatus('failed')
        setErrorMessage(data.details || data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setEmailStatus('failed')
      setErrorMessage(error.message)
    }
  }

  const retryEmailSend = async () => {
    setIsRetrying(true)
    await processPaymentSuccess()
    setIsRetrying(false)
  }

  useEffect(() => {
    if (paymentId || (email && vincode)) {
      // Remove localStorage check, always call API
      // Add delay to allow webhook to process first
      const delay = setTimeout(() => {
        processPaymentSuccess()
      }, 2000) // Wait 2 seconds for webhook to process

      // Clean up URL parameters after processing
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      return () => clearTimeout(delay)
    } else {
      setEmailStatus('failed')
      setErrorMessage('დაკარგული payment პარამეტრები')
    }
  }, [paymentId, email, vincode, vendor])

  const getStatusMessage = () => {
    switch (emailStatus) {
      case 'checking':
        return {
          status: 'info',
          message: 'ვამუშავებთ თქვენს გადახდას...'
        }
      case 'sent':
        return {
          status: 'success',
          message: 'რეპორტი გამოგეგზავნებათ ელფოსტაზე!'
        }
      case 'already_sent':
        return {
          status: 'warning',
          message: 'რეპორტი უკვე გამოგეგზავნებთ.'
        }
      case 'failed':
        return {
          status: 'error',
          message: 'ვერ მოხერხდა ავტომატური გაგზავნა. მოგვმართეთ support-ში.'
        }
      default:
        return {
          status: 'info',
          message: 'გთხოვთ დალოდოთ...'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#0d2e49"
    >
      <VStack spacing={6} maxW="600px" textAlign="center">
        <Heading color="green.500" mb={2}>
          გადახდა წარმატებით დასრულდა
        </Heading>

        <Text fontSize="lg" mb={4}>
          გმადლობთ რომ სარგებლობთ ჩვენი სერვისით!
        </Text>
        <Text
          fontSize="lg"
          mb={4}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
        >
          <Box
            as="span"
            color="orange.400"
            display="inline-flex"
            alignItems="center"
            mr={2}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1.2em"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </Box>
          როდესაც შეტყობინება გამოიგზავნება, გთხოვთ შეამოწმოთ თქვენი ელფოსტის
          SPAM.
        </Text>

        <Alert status={statusInfo.status} borderRadius="md">
          <AlertIcon />
          <VStack align="start" flex="1">
            <Text fontWeight="bold">{statusInfo.message}</Text>
            {emailStatus === 'checking' && (
              <Box display="flex" alignItems="center" gap={2}>
                <Spinner size="sm" />
                <Text fontSize="sm">
                  ვამზადებთ PDF რეპორტს და ვგზავნით ელფოსტაზე...
                </Text>
              </Box>
            )}
            {emailStatus === 'failed' && errorMessage && (
              <Text fontSize="sm" color="red.600">
                შეცდომა: {errorMessage}
              </Text>
            )}
          </VStack>
        </Alert>
        <Link href="/" passHref>
          <Button colorScheme="blue" size="lg">
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Link>

        {process.env.NODE_ENV === 'development' && (
          <Box mt={4} p={4} bg="gray.100" borderRadius="md" fontSize="sm">
            <Text fontWeight="bold">Debug Info:</Text>
            <Text>Payment ID: {paymentId}</Text>
            <Text>Email: {email}</Text>
            <Text>VIN: {vincode}</Text>
            <Text>Vendor: {vendor}</Text>
            <Text>Status: {emailStatus}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
