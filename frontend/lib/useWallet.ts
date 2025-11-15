'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { switchToArcTestnet } from './contracts'

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', () => window.location.reload())
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  async function checkConnection() {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const addr = await signer.getAddress()
        setAddress(addr)
        await updateBalance(addr)
      }
    } catch (err) {
      console.error('Check connection error:', err)
    }
  }

  async function handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      setAddress(null)
      setBalance('0')
    } else {
      setAddress(accounts[0])
      await updateBalance(accounts[0])
    }
  }

  async function updateBalance(addr: string) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const bal = await provider.getBalance(addr)
      setBalance(ethers.formatEther(bal))
    } catch (err) {
      console.error('Update balance error:', err)
    }
  }

  async function connect() {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Switch to Arc Testnet
      await switchToArcTestnet()
      
      // Get account
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      
      setAddress(addr)
      await updateBalance(addr)
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  async function disconnect() {
    setAddress(null)
    setBalance('0')
  }

  return {
    address,
    balance,
    isConnecting,
    error,
    isConnected: !!address,
    connect,
    disconnect,
  }
}