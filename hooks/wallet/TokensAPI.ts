import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { RootState } from '../../store'
import { wallet, tokensSelector } from '../../store/wallet'
import { useWhaleApiClient } from '../api/useWhaleApiClient'

export function fetchTokens (address: string, dispatch: Dispatch<any>, whaleAPI: WhaleApiClient): void {
  whaleAPI.address.listToken(address).then((walletTokens) => {
    dispatch(wallet.actions.setTokens(walletTokens))
  }).catch((error) => console.log(error))

  whaleAPI.address.getBalance(address).then((walletBalance) => {
    dispatch(wallet.actions.setUtxoBalance(walletBalance))
  }).catch((error) => console.log(error))
}

export function useTokensAPI (): AddressToken[] {
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const address = useSelector((state: RootState) => state.wallet.address)
  const dispatch = useDispatch()
  const whaleAPI = useWhaleApiClient()

  useEffect(() => {
    fetchTokens(address, dispatch, whaleAPI)
  }, [])
  return tokens
}
