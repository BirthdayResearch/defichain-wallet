import React, { useEffect, useState } from 'react'
import tailwind from 'tailwind-rn'
import { getPlaygroundApiClient, getPlaygroundRpcClient } from '../../../app/api/playground'
import { getWallet, hasWallet } from '../../../app/wallet'
import { Text, View } from '../../../components'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundUTXO (): JSX.Element | null {
  const rpcClient = getPlaygroundRpcClient()
  const apiClient = getPlaygroundApiClient()

  const [status, setStatus] = useState<string>('loading')

  useEffect(() => {
    apiClient.playground.wallet().then(() => {
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [])

  if (!hasWallet()) {
    return null
  }

  const actions = status === 'online' ? (
    <PlaygroundAction
      testID='playground_wallet_top_up'
      title='Top up 10 DFI UTXO to Wallet'
      onPress={async () => {
        const address = await getWallet().get(0).getAddress()
        await rpcClient.wallet.sendToAddress(address, 10)
      }}
    />
  ) : null

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-2xl font-bold')}>UTXO</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus
            online={status === 'online'}
            loading={status === 'loading'}
            error={status === 'error'}
          />
        </View>
      </View>

      {actions}
    </View>
  )
}
