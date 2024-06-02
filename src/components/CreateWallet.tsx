'use client'
import { useWallet } from '@/providers/WalletProvider'
import { Box, Button, Container, Heading } from '@chakra-ui/react'

export default function CreateWallet() {
  const { createStealthMetaAddress } = useWallet()

  return (
    <Container maxW="xl" my={24} bg="gray.700" borderRadius="xl">
      <Box textAlign="center" p={8}>
        <Heading>Welcome!</Heading>
        <Box mt={6} fontSize="xl">
          Explore the alternative blockhain privacy
        </Box>
        <Button onClick={createStealthMetaAddress} colorScheme="green" mt={6}>
          Create Wallet & Get Started
        </Button>
      </Box>
    </Container>
  )
}
