import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { View } from '../../../components'
import { usePlaygroundContext } from '../../../contexts/PlaygroundContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../contexts/WhaleContext'
import { fetchTokens } from '../../../hooks/wallet/TokensAPI'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'

export function PlaygroundUTXO (): JSX.Element {
  const { wallet } = useWalletContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const { api, rpc } = usePlaygroundContext()
  const [status, setStatus] = useState<string>('loading')

  useEffect(() => {
    api.wallet.balances().then(() => {
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [wallet])

  return (
    <View>
      <PlaygroundTitle
        title='UTXO' status={{
          online: status === 'online',
          loading: status === 'loading',
          error: status === 'error'
        }}
      />

      {status === 'online'
        ? (
          <>
            <PlaygroundAction
              testID='playground_wallet_top_up'
              title='Top up 10 DFI UTXO to Wallet'
              onPress={async () => {
                const address = await wallet.get(0).getAddress()
                await rpc.wallet.sendToAddress(address, 10)
              }}
            />
            <PlaygroundAction
              testID='playground_wallet_fetch_balances'
              title='Fetch Balances'
              onPress={async () => {
                const address = await wallet.get(0).getAddress()
                fetchTokens(whaleApiClient, address, dispatch)
              }}
            />
          </>
          )
        : null}
    </View>
  )
}
