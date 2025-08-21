import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { validateMail, validateVincode } from '../lib/validate'
import {
  Container,
  Heading,
  FormControl,
  Input,
  Box,
  HStack,
  Text,
  useToast,
  Button
} from '@chakra-ui/react'
import { Lang } from '../context'
import langData from '../locales/langs'
import { FaBarcode } from 'react-icons/fa'
import { CiMail } from 'react-icons/ci'
import { getEnvVar } from '../lib/getEnvVar'
const initValues = {
  vin: '',
  email: ''
}
import Image from 'next/image'
import image from '../public/car.png'

const initState = { values: initValues }

export default function Form() {
  const toast = useToast()
  const [state, setState] = useState(initState)
  const [vendor, setVendor] = useState('carfax')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isCarfaxFlipped, setIsCarfaxFlipped] = useState(false)
  const [touched, setTouched] = useState({})
  const { lang, setLang } = useContext(Lang)
  const { form, errors, successes, hero } = langData[lang]
  const {
    values,
    isLoading,
    error,
    success,
    validationError,
    isUrlLoading,
    serverError
  } = state

  useEffect(() => {
    if (validationError)
      toast({
        title: errors['validation'],
        description: validationError,
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true
      })
  }, [toast, validationError, errors])

  useEffect(() => {
    if (success)
      toast({
        title: successes['found'],
        description: success,
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true
      })
  }, [toast, success, successes])

  useEffect(() => {
    if (error)
      toast({
        title: errors['notFoundTitle'],
        description: error,
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true
      })
  }, [toast, error, errors])

  useEffect(() => {
    if (serverError)
      toast({
        title: 'Error',
        description: errors['balance'],
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true
      })
  }, [toast, serverError, errors])

  const onBlur = ({ target }) =>
    setTouched((prev) => ({ ...prev, [target.name]: true }))

  const handleChange = ({ target }) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }))
  }

  const setLoading = (loadingState) => {
    setState((prev) => ({
      ...prev,
      isLoading: loadingState
    }))
  }

  const setError = (errorText = '') => {
    setState((prev) => ({
      ...prev,
      error: errorText
    }))
  }

  const setValidationError = (errorText = '') => {
    setState((prev) => ({
      ...prev,
      validationError: errorText
    }))
  }

  const setSeccuss = (text = '') => {
    setState((prev) => ({
      ...prev,
      success: text
    }))
  }

  const setServerError = (text = '') => {
    setState((prev) => ({
      ...prev,
      serverError: text
    }))
  }

  const handleCarfax = () => {
    setVendor('carfax')
    setIsCarfaxFlipped(true)
    setIsFlipped(false)
  }

  const handleAutocheck = () => {
    setVendor('autocheck')
    setIsFlipped(true)
    setIsCarfaxFlipped(false)
  }

  const handleTransaction = async () => {
    setState((prev) => ({
      ...prev,
      isUrlLoading: true
    }))
    try {
      const res = await axios.post('/api/checkout', {
        vendor,
        vincode: values.vin.toUpperCase(),
        mail: values.email
      })
      const data = res.data
      if (
        res.status !== 200 ||
        !data.response ||
        !data.response.transactionUrl
      ) {
        setError(errors['payment'] || 'Payment error')
        setState((prev) => ({ ...prev, isUrlLoading: false }))
        return
      }
      window.location.replace(data.response.transactionUrl)
    } catch (err) {
      setError(errors['payment'] || 'Payment error')
      setState((prev) => ({ ...prev, isUrlLoading: false }))
    }
  }

  const onSubmit = async () => {
    setLoading(true)
    setError()
    setSeccuss()
    setValidationError()

    const vin = state.values.vin.toUpperCase().trim()
    const email = state.values.email.trim()

    if (!validateMail(email)) {
      setValidationError(errors['setValidation'])
      setLoading(false)
      return
    }
    if (!validateVincode(vin) || vin.length !== 17) {
      setValidationError(errors['setValidation'])
      setLoading(false)
      return
    }

    const getReportStatus = async (vend, vincode, email) => {
      try {
        const balanceRes = await axios.get('/api/balance')
        if (balanceRes.status === 200) {
          const res = await axios.get(
            `/api/car-info?vendor=${vend}&vincode=${vincode}&receiver=${email}`
          )
          const reportStatus = res.data
          if (!reportStatus.reportFound) {
            setError(errors['notFound'])
          } else {
            setState((prev) => ({
              ...prev,
              success: successes['found']
            }))
          }
        } else {
          setServerError(errors['balance'])
        }
        setLoading(false)
      } catch (err) {
        // Log error details for debugging
        if (err.response) {
          console.error('Report status error:', err.response.data)
          setError(err.response.data.msg || errors['server'] || 'Server error')
        } else {
          console.error('Report status error:', err)
          setError(errors['server'] || 'Server error')
        }
        setLoading(false)
      }
    }

    await getReportStatus(vendor, vin, email)
  }

  return (
    <Box
      ml="auto"
      mr="auto"
      h={{ base: '600px', md: '650px', lg: '780px' }}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      pt={{ base: '40px', md: '60px', lg: '80px' }}
      position="relative"
      backgroundImage={`url('/car.png')`}
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bg: 'rgba(0,0,0,0.25)',
        zIndex: 0,
        borderRadius: '0'
      }}
    >
      <Box
        w={{ base: '300px', md: '350px', lg: '450px' }}
        pb="40px"
        h="fit-content"
        borderRadius="20px"
        backdropFilter="blur(10px)"
        backgroundColor="rgba(100,100,100,.2)"
        position="relative"
        zIndex={1}
      >
        <Heading
          color="#504A4B"
          textColor="white"
          fontWeight="semibold"
          display={'flex'}
          mt={'30px'}
          mb={'30px'}
          justifyContent={'center'}
          alignItems={'center'}
          fontSize={{ base: '18px', md: '22px', lg: '24px' }}
        >
          {form['form-top']}
        </Heading>

        <Container
          maxW={['90%', '340px', '300px']}
          backgroundColor="white"
          color="black"
          borderRadius="2px"
          pt="20px"
          pb="15px"
          boxShadow="0px 10px 15px -3px rgba(0,0,0,0.1)"
        >
          <HStack mb="20px" justifyContent="center">
            <Box
              h="60px"
              w="160px"
              perspective="600px"
              onClick={handleCarfax}
              cursor="pointer"
            >
              <Box
                position="relative"
                width="100%"
                height="100%"
                transition="transform 0.6s"
                transform={isCarfaxFlipped ? 'rotateY(180deg)' : 'none'}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <Button
                  h="60px"
                  w="160px"
                  border="1px"
                  backgroundColor={vendor === 'carfax' ? '#FFF5F5' : '#F1F5FB'}
                  borderColor={vendor === 'carfax' ? 'red' : 'white'}
                  display="flex"
                  flexDirection="column"
                  boxShadow={
                    vendor === 'carfax' ? '0 4px 20px 0 rgba(0,0,0,0.15)' : 'md'
                  }
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                    transform: 'scale(1.05)',
                    background: '#F0F8FF',
                    borderColor: 'blue.400',
                    zIndex: 2
                  }}
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Text
                    mt="10px"
                    textColor="blue.600"
                    w="full"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
                  >
                    {form['form-carfax']}
                  </Text>
                  <Text
                    mt="5px"
                    color="red.300"
                    textAlign="justify"
                    fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                  >
                    {process.env.NEXT_PUBLIC_CARFAX_PRICE}₾
                  </Text>
                </Button>
                {/* Back Side */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-br, red.400, red.700)"
                  color="white"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                  pointerEvents="none"
                  style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <Text fontSize="lg" fontWeight="bold">
                    {process.env.NEXT_PUBLIC_CARFAX_PRICE}₾
                  </Text>
                  <Text fontSize="xs" mt={2}>
                    Carfax Price
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box
              h="60px"
              w="160px"
              perspective="600px"
              onClick={handleAutocheck}
              cursor="pointer"
            >
              <Box
                position="relative"
                width="100%"
                height="100%"
                transition="transform 0.6s"
                transform={isFlipped ? 'rotateY(180deg)' : 'none'}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <Button
                  h="60px"
                  w="160px"
                  border="1px"
                  backgroundColor={
                    vendor === 'autocheck' ? '#FFF5F5' : '#F1F5FB'
                  }
                  borderColor={vendor === 'autocheck' ? 'red' : 'white'}
                  display="flex"
                  flexDirection="column"
                  boxShadow={
                    vendor === 'autocheck'
                      ? '0 4px 20px 0 rgba(0,0,0,0.15)'
                      : 'md'
                  }
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                    transform: 'scale(1.05)',
                    background: '#F0F8FF',
                    borderColor: 'blue.400',
                    zIndex: 2
                  }}
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Text
                    mt="10px"
                    textColor="blue.600"
                    w="full"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
                  >
                    {form['form-carcheck']}
                  </Text>
                  <Text
                    mt="5px"
                    color="red.400"
                    textAlign="justify"
                    fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                  >
                    {process.env.NEXT_PUBLIC_AUTOCHECK_PRICE}₾
                  </Text>
                </Button>
                {/* Back Side */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-br, blue.400, blue.700)"
                  color="white"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                  pointerEvents="none"
                  style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <Text fontSize="lg" fontWeight="bold">
                    {process.env.NEXT_PUBLIC_AUTOCHECK_PRICE}₾
                  </Text>
                  <Text fontSize="xs" mt={2}>
                    Autocheck Price
                  </Text>
                </Box>
              </Box>
            </Box>
          </HStack>
          <FormControl
            alignItems="center"
            fontSize="25px"
            display="flex"
            isRequired
            isInvalid={touched.vin && !values.vin}
            mb={5}
          >
            <FaBarcode />
            <Input
              type="text"
              name="vin"
              placeholder="VIN"
              errorBorderColor="red.300"
              _placeholder={{ color: 'gray' }}
              variant="flushed"
              outline="none"
              ml="5px"
              mr="5px"
              value={values.vin}
              onChange={handleChange}
              onBlur={onBlur}
            />
          </FormControl>

          <FormControl
            isRequired
            isInvalid={touched.email && !values.email}
            mb={5}
            display="flex"
            alignItems="center"
            fontSize="25px"
          >
            <CiMail />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              _placeholder={{ color: 'gray' }}
              errorBorderColor="red.300"
              color="black"
              variant="flushed"
              ml="5px"
              mr="5px"
              fontSize={{ base: '14px', md: '16px', lg: '16px' }}
              value={values.email}
              onChange={handleChange}
              onBlur={onBlur}
            />
          </FormControl>
          {success && !error ? (
            <Button
              size="md"
              variant="solid"
              w={'70%'}
              ml="15%"
              colorScheme="blue"
              onClick={handleTransaction}
              isLoading={isUrlLoading}
              disabled={
                !validateMail(values.email) ||
                !validateVincode(values.vin.toUpperCase()) ||
                values.vin.length !== 17
              }
            >
              {form['form-payment']}
            </Button>
          ) : (
            <Button
              variant="outline"
              w={'70%'}
              ml="15%"
              colorScheme="blue"
              disabled={!values.vin || !values.email}
              onClick={onSubmit}
              isLoading={isLoading}
            >
              {form['form-check']}
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  )
}
