import { ApiPagedResponse, WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { RootState } from '../../store'
import { setTokens, setUtxoBalance, tokensSelector } from '../../store/wallet'
import { useWhaleApiClient } from '../api/useWhaleApiClient'
import { useWalletAPI } from './WalletAPI'

const fetchWalletTokens = async (address: string, whaleAPI: WhaleApiClient): Promise<ApiPagedResponse<AddressToken>> => {
  return await whaleAPI.address.listToken(address)
}

const fetchWalletBalance = async (address: string, whaleAPI: WhaleApiClient): Promise<string> => {
  return await whaleAPI.address.getBalance(address)
}

const fetchWalletData = (address: string, dispatch: Dispatch<any>, whaleAPI: WhaleApiClient): void => {
  fetchWalletTokens(address, whaleAPI).then((walletTokens) => {
    dispatch(setTokens(walletTokens))
  }).catch((error) => console.log(error))

  fetchWalletBalance(address, whaleAPI).then((walletBalance) => {
    dispatch(setUtxoBalance(walletBalance))
  }).catch((error) => console.log(error))
}

export function useTokensAPI (): AddressToken[] {
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const account = useWalletAPI().getWallet().get(0)
  const dispatch = useDispatch()
  const whaleAPI = useWhaleApiClient()

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    account.getAddress().then(async address => {
      await fetchWalletData(address, dispatch, whaleAPI)
      intervalId = setInterval(() => {
        fetchWalletData(address, dispatch, whaleAPI)
      }, 10000)
    }).catch((error) => console.log(error))
    return () => clearInterval(intervalId)
  }, [])
  return tokens
}
