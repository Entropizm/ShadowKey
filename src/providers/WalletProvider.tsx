import React, { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import * as secp from '@noble/secp256k1'
import { keccak256 } from 'ethers'
import registryAbi from '@/abi/ERC5564Registry.json'
import announcerAbi from '@/abi/ERC5564Announcer.json'
import transferAbi from '@/abi/StealthTransfer.json'

const REGISTRY_ADDRESS = '0xc039c13470be809bed1c2cd42339ccb22e0970f2'
const STEALTH_TRANSFER_ADDRESS = '0xa5f90284a54c9857be4d0c40fe4be23457c1ff9f'
const ANNOUNCER_ADDRESS = '0xc6b69d83db6d40b3b644436e3a36252801fc0f64'
const GAS_MULTIPLIER = 3

type Wallet = {
  address?: string
  balance?: bigint
  stealthMetaAddressData?: StealthMetaAddressData
  isLoading: boolean
  isRegistered: boolean
  createStealthMetaAddress: () => void
  registerKeys: () => Promise<void>
  sendTokens: (recipientAddress: string, amount: bigint) => Promise<string>
  getAnnouncementHistory: () => any
}

type StealthMetaAddressData = {
  spendingPrivateKey: string
  viewingPrivateKey: string
  spendingPublicKey: string
  viewingPublicKey: string
  stealthMetaAddress: string
}

type Props = {
  children: any
}

const initialValue = {
  address: undefined,
  balance: undefined,
  stealthMetaAddressData: undefined,
  isLoading: false,
  isRegistered: false,
  createStealthMetaAddress: () => {},
  registerKeys: async () => {},
  sendTokens: async () => '',
  getAnnouncementHistory: async () => {},
}

const WalletContext = createContext<Wallet>(initialValue)

export const useWallet = () => {
  return useContext(WalletContext)
}

export default function WalletProvider({ children }: Props) {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider>()
  const [signer, setSigner] = useState<ethers.Wallet>()
  const [balance, setBalance] = useState<bigint>()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [stealthMetaAddressData, setStealthMetaAddressData] =
    useState<StealthMetaAddressData>()

  const pointToEthAddress = (point: secp.ProjectivePoint) =>
    `0x${keccak256(point.toRawBytes(true).slice(1)).slice(-40)}`

  const bytesToHex = (uint8Array: Uint8Array) => {
    return Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const generateRandomPrivateKey = () => {
    var randPrivateKey = secp.utils.randomPrivateKey()
    return `${bytesToHex(randPrivateKey)}`
  }

  const getBalance = async () => {
    if (provider && signer) {
      setIsLoading(true)
      const balanceResult = await provider.getBalance(signer.address)
      setBalance(balanceResult)
      setIsLoading(false)
    }
  }

  const parseStealthData = ({
    ephemeralPublicKey,
    stealthAddress,
    metadata,
  }: {
    ephemeralPublicKey: string
    stealthAddress: string
    metadata: string
  }) => {
    if (!stealthMetaAddressData) {
      return
    }
    const ephemeralPublicKeyPoint = secp.ProjectivePoint.fromHex(
      ephemeralPublicKey.slice(2),
    )
    const spendingPublicKey = secp.ProjectivePoint.fromHex(
      stealthMetaAddressData.spendingPublicKey,
    )
    const sharedSecret = secp.getSharedSecret(
      stealthMetaAddressData.viewingPrivateKey,
      ephemeralPublicKeyPoint.toHex(),
    )
    const hashedSharedSecret = keccak256(sharedSecret.slice(1))
    const hashedSharedSecretPoint = secp.ProjectivePoint.fromPrivateKey(
      hashedSharedSecret.slice(2),
    )
    const stealthPublicKey = spendingPublicKey.add(hashedSharedSecretPoint)
    const calculatedStealthAddress = pointToEthAddress(stealthPublicKey)
    if (
      stealthAddress.toLowerCase() !== calculatedStealthAddress.toLowerCase()
    ) {
      return undefined
    }
    return {
      stealthAddress,
      ephemeralPublicKey,
      hashedSharedSecret,
    }
  }

  const generateStealthData = (stealthMetaAddress: string) => {
    const spendingPublicKey = secp.ProjectivePoint.fromHex(
      stealthMetaAddress.slice(2, 68),
    )
    const viewingPublicKey = secp.ProjectivePoint.fromHex(
      stealthMetaAddress.slice(68),
    )
    const ephemeralPrivateKey = generateRandomPrivateKey()
    const ephemeralPublicKey = secp.getPublicKey(ephemeralPrivateKey, true)
    const sharedSecret = secp.getSharedSecret(
      ephemeralPrivateKey,
      viewingPublicKey.toHex(),
    )
    const hashedSharedSecret = keccak256(sharedSecret.slice(1))
    const metadata = hashedSharedSecret.slice(0, 4)
    const hashedSharedSecretPoint = secp.ProjectivePoint.fromPrivateKey(
      hashedSharedSecret.slice(2),
    )
    const stealthPublicKey = spendingPublicKey.add(hashedSharedSecretPoint)
    const stealthAddress = pointToEthAddress(stealthPublicKey)
    return {
      stealthAddress: stealthAddress,
      ephemeralPublicKey: `0x${bytesToHex(ephemeralPublicKey)}`,
      metadata,
    }
  }

  const createStealthMetaAddress = () => {
    const spendingPrivateKey = generateRandomPrivateKey()
    const viewingPrivateKey = generateRandomPrivateKey()
    const spendingPublicKey = bytesToHex(
      secp.getPublicKey(spendingPrivateKey, true),
    )
    const viewingPublicKey = bytesToHex(
      secp.getPublicKey(viewingPrivateKey, true),
    )
    const stealthMetaAddress = `0x${spendingPublicKey}${viewingPublicKey}`
    const stealthMetaAddressData = {
      spendingPrivateKey,
      viewingPrivateKey,
      spendingPublicKey,
      viewingPublicKey,
      stealthMetaAddress,
    }
    localStorage.setItem(
      'stealthMetaAddressData',
      JSON.stringify(stealthMetaAddressData),
    )
    const providerResult = new ethers.JsonRpcProvider('https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
    const wallet = new ethers.Wallet(viewingPrivateKey)
    setStealthMetaAddressData(stealthMetaAddressData)
    setProvider(providerResult)
    setSigner(wallet)
  }

  const registerKeys = async () => {
    if (!stealthMetaAddressData || !provider) {
      throw new Error('Provider is not initialized')
    }
    const gasPrice = (await provider.getFeeData()).gasPrice
    if (!gasPrice) {
      throw new Error('Could not calculate gas price')
    }
    const adjustedGasPrice =
      (gasPrice * BigInt(GAS_MULTIPLIER * 10)) / BigInt(10)
    const contract = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, signer)
    const tx = await contract.registerKeys(
      ethers.ZeroHash,
      stealthMetaAddressData.stealthMetaAddress,
      { gasPrice: adjustedGasPrice },
    )
    await tx.wait()
    localStorage.setItem('isRegistered', 'true')
    setIsRegistered(true)
  }

  const sendTokens = async (recipientAddress: string, amount: bigint) => {
    if (!stealthMetaAddressData || !provider) {
      throw new Error('Stealth Meta Address or provider is not initialized.')
    }
    const registryContract = new ethers.Contract(
      REGISTRY_ADDRESS,
      registryAbi,
      signer,
    )
    const metaAddress = await registryContract.stealthMetaAddressOf(
      recipientAddress,
      0,
    )
    console.log(metaAddress)
    if (!metaAddress || metaAddress === '0x') {
      throw new Error(
        'Stealth Meta Address is not found for this address. Check if it is registered.',
      )
    }
    const { stealthAddress, ephemeralPublicKey, metadata } =
      generateStealthData(metaAddress)
    if (!stealthAddress) {
      throw new Error('Could not generate stealth address.')
    }
    const transferContract = new ethers.Contract(
      STEALTH_TRANSFER_ADDRESS,
      transferAbi,
      signer,
    )
    const gasPrice = (await provider.getFeeData()).gasPrice
    if (!gasPrice) {
      throw new Error('Could not calculate gas price')
    }
    const adjustedGasPrice =
      (gasPrice * BigInt(GAS_MULTIPLIER * 10)) / BigInt(10)
    console.log(
      stealthAddress,
      ephemeralPublicKey,
      metadata,
      { value: amount },
      { adjustedGasPrice, gasPrice },
    )
    const tx = await transferContract.transferEthAndAnnounce(
      0,
      stealthAddress,
      ephemeralPublicKey,
      metadata,
      { value: amount, gasPrice: adjustedGasPrice },
    )
    await tx.wait()
    return stealthAddress
  }

  const getAnnouncementHistory = async () => {
    if (!provider) {
      throw new Error('Provider is not initialized')
    }

    const currentBlock = await provider.getBlockNumber()

    const contract = new ethers.Contract(
      ANNOUNCER_ADDRESS,
      announcerAbi,
      provider,
    )

    const filter = contract.filters['Announcement']()

    const logs = await contract.queryFilter(
      filter,
      currentBlock - 10000,
      currentBlock,
    )

    const parsedLogs = logs.map((log) => contract.interface.parseLog(log))

    const filteredLogs = await Promise.all(
      parsedLogs.map(async (l) => {
        if (!l) {
          return undefined
        }
        try {
          const parsedData = parseStealthData({
            stealthAddress: l.args[1],
            ephemeralPublicKey: l.args[3],
            metadata: l.args[4],
          })
          if (!parsedData) {
            return undefined
          }
          const balanceResult = await provider.getBalance(
            parsedData.stealthAddress,
          )
          return { ...parsedData, balance: balanceResult }
        } catch (e) {
          console.error(e)
          return undefined
        }
      }),
    )

    return filteredLogs.filter((l) => !!l)
  }

  useEffect(() => {
    const savedStealthMetaAddressData = localStorage.getItem(
      'stealthMetaAddressData',
    )
    if (savedStealthMetaAddressData) {
      const parsedData = JSON.parse(savedStealthMetaAddressData)
      const providerResult = new ethers.JsonRpcProvider(
        'https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161	',
      )
      const wallet = new ethers.Wallet(
        parsedData.viewingPrivateKey,
        providerResult,
      )
      setStealthMetaAddressData(parsedData)
      setSigner(wallet)
      setProvider(providerResult)
    }
    const savedIsRegistered = localStorage.getItem('isRegistered')
    if (savedIsRegistered) {
      setIsRegistered(true)
    }
  }, [])

  useEffect(() => {
    getBalance()
  }, [provider])

  return (
    <WalletContext.Provider
      value={{
        address: signer?.address,
        balance,
        stealthMetaAddressData,
        isLoading,
        isRegistered,
        createStealthMetaAddress,
        registerKeys,
        sendTokens,
        getAnnouncementHistory,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
