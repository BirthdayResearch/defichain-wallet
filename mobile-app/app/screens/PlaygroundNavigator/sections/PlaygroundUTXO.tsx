import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { View } from '@components/index'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { fetchTokens } from '@hooks/wallet/TokensAPI'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'

export function PlaygroundUTXO (): JSX.Element {
  const logger = useLogger()
  const { wallet } = useWalletContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const {
    api,
    rpc
  } = usePlaygroundContext()
  const [status, setStatus] = useState<string>('loading')

  useEffect(() => {
    api.wallet.balances().then(() => {
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [wallet])

  const getActiveAddress = async (): Promise<string> => {
    const addressIndex = await WalletAddressIndexPersistence.getActive()
    const account = wallet.get(addressIndex)
    return await account.getAddress()
  }

  return (
    <View>
      <PlaygroundTitle
        status={{
          online: status === 'online',
          loading: status === 'loading',
          error: status === 'error'
        }}
        title='UTXO'
      />

      {status === 'online'
        ? (
          <>
            <PlaygroundAction
              onPress={async () => {
                const address = await getActiveAddress()
                await rpc.wallet.sendToAddress(address, 10)
              }}
              testID='playground_wallet_top_up'
              title='Top up 10 DFI UTXO to Wallet'
            />

            <PlaygroundAction
              onPress={async () => {
                const address = await getActiveAddress()
                fetchTokens(whaleApiClient, address, dispatch, logger)
              }}
              testID='playground_wallet_fetch_balances'
              title='Fetch Balances'
            />
          </>
          )
        : null}
    </View>
  )
}
