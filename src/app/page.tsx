import Wallet from '@/components/Wallet'
import { Box, Container, Heading } from '@chakra-ui/react'

export default function Home() {
  return (
    <Container maxW="1200px">
      <Heading mt={12} textAlign="center">
        ShadowKey
      </Heading>
      <Wallet />
    </Container>
  )
}
