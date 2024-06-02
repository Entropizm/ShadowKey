'use client'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './theme'
import WalletProvider from '@/providers/WalletProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <WalletProvider>{children}</WalletProvider>
    </ChakraProvider>
  )
}
