import React, { useEffect, useState } from 'react'
import { Text, View } from '../../../components'
import { usePlaygroundContext } from '../../../contexts/PlaygroundContext'
import { useWallet } from '../../../contexts/WalletContext'
import { tailwind } from '../../../tailwind'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundUTXO (): JSX.Element {
  const wallet = useWallet()
  const { api, rpc } = usePlaygroundContext()
  const [status, setStatus] = useState<string>('loading')

  useEffect(() => {
    api.wallet.balances().then(() => {
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [])

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-xl font-bold')}>UTXO</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus
            online={status === 'online'}
            loading={status === 'loading'}
            error={status === 'error'}
          />
        </View>
      </View>

      {status === 'online' ? (
        <PlaygroundAction
          testID='playground_wallet_top_up'
          title='Top up 10 DFI UTXO to Wallet'
          onPress={async () => {
            const address = await wallet.get(0).getAddress()
            await rpc.wallet.sendToAddress(address, 10)
          }}
        />
      ) : null}
    </View>
  )
}
