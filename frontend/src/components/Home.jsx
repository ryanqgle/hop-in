// The landing page shown at "/". This is the first thing visitors see before
// they log in — a short welcome message and a prompt to sign in.
import {Box, Button, Flex, Heading, Text, VStack, HStack, Image, useColorModeValue, useToast} from '@chakra-ui/react'
import {useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import {useAuth} from '../auth.jsx'
import {apiUrl} from '../api.js'

export default function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const logoSrc = useColorModeValue('/logo-black.PNG', '/logo-white.PNG')
  const {token} = useAuth()
  const [role, setRole]= useState(null)

  useEffect(() => {
    if (!token) return

    fetch(apiUrl('/api/edit-profile'), {
      headers: {Authorization: `Bearer ${token}`},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 'success') {
          setRole(data.profile?.role)
        }
      })
      .catch((err) => console.error('Failed to load role:', err))
  }, [token])

  const handleFindRide = () => {
    if (!token) {
      navigate('/login')
      return
    }

    if (role === 'driver') {
      toast({
        title: 'Switch to passenger first!',
        description: 'Go to your profile and change your role to passenger before finding rides',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      navigate('/profile')
      return
    }
    navigate('/dashboard')

  }

  const handleOfferRide = () => {
    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'driver') {
      toast({
        title: 'Switch to driver first!',
        description: 'Go to your profile and change your role to driver before offering a ride',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      navigate('/profile')
      return
    }

    navigate('/create-ride')
  }

  return (
    <Box px={{base: 6, md: 16}} py={{base: 12, md: 24}}>
      <Flex
        aling="center"
        justify="space-between"
        gap={12}
        direction={{base: 'column', md: 'row'}}
      >
        <VStack align={{base: 'center', md: 'flex-start'}} spacing={5} flex="1">
          <Heading
            fontSize={{base: '5xl', md: '7xl'}}
            lineHeight="1"
            fontWeight="extrabold"
          >
            Hop In
          </Heading>

          <Text
            fontSize={{base: '2xl', md: '3xl'}}
            fontWeight="bold"
            color="purple.600"
            textAlign={{ base: 'center', md: 'left'}}
          >
            Share rides with fellow students
          </Text>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.600"
            maxW="420px"
            textAlign={{ base: 'center', md: 'left' }}
          >
            Save money, reduce traffic, and get there together
          </Text>

          <HStack spacing={4} pt={3}>
            <Button
              colorScheme="purple"
              size="lg"
              borderRadius="lg"
              onClick={handleFindRide}
            >
              Find a Ride
            </Button>

            <Button
              variant="outline"
              colorScheme="purple"
              size="lg"
              borderRadius="lg"
              onClick={handleOfferRide}
            >
              Offer a Ride
            </Button>
          </HStack>
        </VStack>

          <Box flex="1" display="flex" justifyContent="center">
            <Box
              bg="purple.50"
              borderRadius="full"
              p={{ base: 8, md: 12 }}
              maxW="520px"
            >
              <Image
                src={logoSrc}
                alt="Hop In bunny car"
                maxH={{ base: '220px', md: '360px' }}
                objectFit="contain"
              />
            </Box>
          </Box>
      </Flex>
    </Box>
  )
}
