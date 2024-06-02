'use client'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import CreateWallet from './CreateWallet'
import { useWallet } from '@/providers/WalletProvider'
import { formatEther, parseUnits } from 'ethers'
import Loader from './Loader'
import { useEffect, useState } from 'react'

export default function Wallet() {
  const {
    address,
    balance,
    stealthMetaAddressData,
    isLoading: isWalletLoading,
    isRegistered,
    registerKeys,
    sendTokens,
    getAnnouncementHistory,
  } = useWallet()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistrationLoading, setIsRegistrationLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [sendAddress, setSendAddress] = useState<string>()
  const [sendAmount, setSendAmount] = useState<string>()
  const [newStealthAddress, setNewStealthAddress] = useState<string>()
  const [history, setHistory] = useState<any>()

  const handleRegister = async () => {
    try {
      setIsRegistrationLoading(true)
      await registerKeys()
      toast({ status: 'success', title: 'Transaction successful' })
    } catch (e) {
      console.error(e)
      toast({
        status: 'error',
        title:
          'Transaction failed. Check if you have enough tokens for gas fees in this wallet',
      })
    } finally {
      setIsRegistrationLoading(false)
    }
  }

  const handleSend = async () => {
    if (!sendAddress || !sendAmount) {
      toast({
        status: 'error',
        title: 'Please fill all fields',
      })
      return
    }
    try {
      setIsLoading(true)
      const resultAddress = await sendTokens(
        sendAddress,
        parseUnits(sendAmount),
      )
      setNewStealthAddress(resultAddress)
    } catch (e: any) {
      console.error(e)
      toast({
        status: 'error',
        title: e.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address && balance !== undefined) {
      setIsHistoryLoading(true)
      getAnnouncementHistory().then((r: any) => {
        console.log(r)
        setHistory(r)
        setIsHistoryLoading(false)
      })
    }
  }, [address, balance])

  return (
    <Box py={12}>
      {!isWalletLoading && !address && <CreateWallet />}
      {!isWalletLoading &&
        address &&
        balance !== undefined &&
        stealthMetaAddressData && (
          <>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
              <Box bg="gray.700" borderRadius="xl" py={8} px={6}>
                <Box textAlign="center">
                  <Box>Balance</Box>
                  <Heading>
                    {parseFloat(formatEther(balance)).toFixed(2)} ETH
                  </Heading>
                </Box>
                {!isRegistered && (
                  <>
                    {!isRegistrationLoading && (
                      <>
                        <Divider my={6} />
                        <Heading fontSize="2xl">Complete Setup</Heading>
                        <Box mt={3}>
                          Your new wallet is created. Now it is necessary to
                          register the stealth address metadata on-chain to
                          accept transfers.
                        </Box>
                        <Box mt={3} fontWeight="bold">
                          Transfer at least 0.05 ETH to this wallet and
                          register.
                        </Box>
                        <Button
                          onClick={handleRegister}
                          w="full"
                          colorScheme="green"
                          mt={3}
                        >
                          Register
                        </Button>
                      </>
                    )}
                    {isRegistrationLoading && (
                      <Loader label="Executing Transaction" />
                    )}
                  </>
                )}
                <Divider my={6} />
                <Box>
                  <Box fontWeight="bold">Wallet Address</Box>
                  <Box opacity={0.8} mt={1}>
                    {address}
                  </Box>
                </Box>
                <Box mt={3}>
                  <Box fontWeight="bold">Stealth Meta Address</Box>
                  <Box opacity={0.8} mt={1}>
                    {stealthMetaAddressData.stealthMetaAddress}
                  </Box>
                </Box>
              </Box>
              <Box bg="gray.700" borderRadius="xl" py={8} px={6}>
                {!isLoading && !newStealthAddress && (
                  <>
                    <Heading fontSize="3xl">Send Tokens</Heading>
                    {!isRegistered && (
                      <Box mt={6}>Register your wallet to send tokens</Box>
                    )}
                    {isRegistered && (
                      <>
                        <Box mt={6}>
                          <Box mb={2}>Recipient</Box>
                          <Input
                            placeholder="Enter Address (0x...)"
                            onChange={(e) => setSendAddress(e.target.value)}
                          />
                        </Box>
                        <Box mt={3}>
                          <Box mb={2}>Amount</Box>
                          <Flex gap={3} align="center">
                            <Input
                              placeholder="Enter Amount"
                              type="number"
                              maxW="xs"
                              onChange={(e) => setSendAmount(e.target.value)}
                            />
                            <Box fontWeight="bold">ETH</Box>
                          </Flex>
                        </Box>
                        <Button
                          onClick={handleSend}
                          colorScheme="green"
                          w="full"
                          mt={6}
                        >
                          Transfer
                        </Button>
                      </>
                    )}
                  </>
                )}
                {!isLoading && newStealthAddress && (
                  <Box>
                    <Heading fontSize="3xl" color="green.300">
                      Transaction Completed
                    </Heading>
                    <Box fontWeight="bold" mt={6}>
                      New stealth address
                    </Box>
                    <Box opacity={0.8} mb={6} mt={1}>
                      {newStealthAddress}
                    </Box>
                    <Link
                      href={`https://sepolia.lineascan.build/address/${newStealthAddress}`}
                      target="_blank"
                    >
                      <Button>View on Explorer</Button>
                    </Link>
                  </Box>
                )}
                {isLoading && <Loader label="Executing Transaction" />}
              </Box>
            </SimpleGrid>

            <Box mt={6} bg="gray.700" borderRadius="xl" py={8} px={6}>
              <Heading fontSize="3xl">My Stealth Wallets</Heading>
              {!isHistoryLoading && history && history.length > 0 && (
                <TableContainer mt={6}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Address</Th>
                        <Th>Balance</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {history.map((h: any) => (
                        <Tr key={h.stealthAddress}>
                          <Td>{h.stealthAddress}</Td>
                          <Td>{formatEther(h.balance)} ETH</Td>
                          <Td isNumeric>
                            <Flex gap={2} justify="end">
                              <Link
                                href={`https://sepolia.lineascan.build/address/${h.stealthAddress}`}
                                target="_blank"
                                fontWeight="bold"
                              >
                                <Button>View on Explorer</Button>
                              </Link>
                              <Button>Copy Private Key</Button>
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
              {!isHistoryLoading && history && history.length === 0 && (
                <Box mt={6}>No stealth wallets available yet</Box>
              )}
              {isHistoryLoading && <Loader />}
            </Box>
          </>
        )}
      {isWalletLoading && <Loader />}
    </Box>
  )
}
