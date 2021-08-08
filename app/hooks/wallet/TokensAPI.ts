import { WhaleApiClient } from '@defichain/whale-api-client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { useWalletAddressContext } from '../../contexts/WalletAddressContext'
import { useWhaleApiClient } from '../../contexts/WhaleContext'
import { RootState } from '../../store'
import { tokensSelector, wallet, WalletToken } from '../../store/wallet'

/**
 * @deprecated need to refactor this
 */
export function fetchTokens (client: WhaleApiClient, address: string, dispatch: Dispatch<any>): void {
  client.address.listToken(address).then((walletTokens) => {
    dispatch(wallet.actions.setTokens(walletTokens))
  }).catch((error) => console.log(error))

  client.address.getBalance(address).then((walletBalance) => {
    dispatch(wallet.actions.setUtxoBalance(walletBalance))
  }).catch((error) => console.log(error))
}

/**
 * @deprecated need to refactor this
 */
export function useTokensAPI (): WalletToken[] {
  const client = useWhaleApiClient()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const { address } = useWalletAddressContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchTokens(client, address, dispatch)
  }, [address, dispatch])
  return tokens
}
