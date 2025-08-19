// Admin panel for managing pending emails
import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Alert,
  AlertIcon,
  Badge,
  VStack,
  HStack,
  Text,
  Spinner,
  useToast
} from '@chakra-ui/react'

export default function AdminPanel() {
  const [pendingEmails, setPendingEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const toast = useToast()

  const loadPendingEmails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pending-emails')
      const data = await response.json()

      if (response.ok) {
        setPendingEmails(data.documents || [])
      } else {
        console.error('Failed to load pending emails:', data)
        toast({
          title: 'შეცდომა',
          description: 'ვერ მოიძებნა pending emails',
          status: 'error',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error loading pending emails:', error)
      toast({
        title: 'შეცდომა',
        description: 'Network error',
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async (doc) => {
    try {
      setProcessing((prev) => ({ ...prev, [doc.id]: true }))

      const response = await fetch('/api/process-payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: doc.id,
          email: doc.mail,
          vincode: doc.vincode
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'წარმატება',
          description: `ემეილი გაიგზავნა: ${doc.mail}`,
          status: 'success',
          duration: 5000
        })
        // Reload the list
        loadPendingEmails()
      } else {
        throw new Error(result.details || result.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'შეცდომა',
        description: `ვერ გაიგზავნა: ${error.message}`,
        status: 'error',
        duration: 7000
      })
    } finally {
      setProcessing((prev) => ({ ...prev, [doc.id]: false }))
    }
  }

  useEffect(() => {
    loadPendingEmails()
  }, [])

  if (loading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack>
          <Spinner size="xl" />
          <Text>იტვირთება pending emails...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading>Admin Panel - Pending Emails</Heading>
          <Button colorScheme="blue" onClick={loadPendingEmails}>
            განახლება
          </Button>
        </HStack>

        {pendingEmails.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            არ არის pending emails
          </Alert>
        ) : (
          <Alert status="warning">
            <AlertIcon />
            {pendingEmails.length} pending email ნაპოვნია
          </Alert>
        )}

        {pendingEmails.length > 0 && (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Payment ID</Th>
                <Th>Email</Th>
                <Th>VIN Code</Th>
                <Th>Vendor</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingEmails.map((doc) => (
                <Tr key={doc.id}>
                  <Td fontSize="xs" fontFamily="mono">
                    {doc.id}
                  </Td>
                  <Td>{doc.mail}</Td>
                  <Td fontFamily="mono">{doc.vincode}</Td>
                  <Td>
                    <Badge
                      colorScheme={doc.vendor === 'carfax' ? 'blue' : 'green'}
                    >
                      {doc.vendor}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={doc.mailSent ? 'green' : 'red'}>
                      {doc.mailSent ? 'Sent' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => sendEmail(doc)}
                      isLoading={processing[doc.id]}
                      loadingText="იგზავნება..."
                      isDisabled={doc.mailSent}
                    >
                      ემეილის გაგზავნა
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Box>
  )
}
