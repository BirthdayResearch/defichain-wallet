import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { getWhaleClient } from '../../middlewares/api/whale'
import { RootState } from '../../store'
import { tokensSelector, wallet, WalletToken } from '../../store/wallet'

/**
 * @deprecated and move into store/ as getWhaleClient is store agnostic now
 */
export function fetchTokens (address: string, dispatch: Dispatch<any>): void {
  const client = getWhaleClient()

  client.address.listToken(address).then((walletTokens) => {
    dispatch(wallet.actions.setTokens(walletTokens))
  }).catch((error) => console.log(error))

  client.address.getBalance(address).then((walletBalance) => {
    dispatch(wallet.actions.setUtxoBalance(walletBalance))
  }).catch((error) => console.log(error))
}

/**
 * @deprecated and move into store/ as getWhaleClient is store agnostic now
 */
export function useTokensAPI (): WalletToken[] {
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const address = useSelector((state: RootState) => state.wallet.address)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchTokens(address, dispatch)
  }, [])
  return tokens
}
