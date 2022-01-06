import { useDispatch } from 'react-redux'
import { View } from '@components'
import { PlaygroundTitle } from '@screens/PlaygroundNavigator/components/PlaygroundTitle'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useEffect, useState } from 'react'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundAction } from '@screens/PlaygroundNavigator/components/PlaygroundAction'
import { fetchTokens } from '@store/wallet'

export function PlaygroundOperations (): JSX.Element {
  const { wallet } = useWalletContext()
  const client = useWhaleApiClient()
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
        title='Operations'
      />

      {status === 'online'
        ? (
          <>
            <PlaygroundAction
              onPress={async () => {
                const address = await getActiveAddress()
                dispatch(fetchTokens({ client, address }))
              }}
              testID='playground_wallet_fetch_balances'
              title='Fetch Balances'
            />

            <PlaygroundAction
              onPress={async () => {
                await rpc.call('generatetoaddress', [10, 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy'], 'number')
              }}
              testID='playground_generate_blocks'
              title='Generate blocks'
            />
          </>
        )
        : null}
    </View>
  )
}
