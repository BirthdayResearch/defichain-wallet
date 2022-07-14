import { useWalletContext } from '@shared-contexts/WalletContext'
import { useCallback } from 'react'

export function useWalletAddress (): {
  fetchWalletAddresses: () => Promise<string[]>
} {
  const {
    wallet,
    addressLength
  } = useWalletContext()

  const fetchWalletAddresses = useCallback(async (): Promise<string[]> => {
    const addresses: string[] = []
    for (let i = 0; i <= addressLength; i++) {
      const account = wallet.get(i)
      const address = await account.getAddress()
      addresses.push(address)
    }
    return addresses
  }, [wallet, addressLength])

  return { fetchWalletAddresses }
}
