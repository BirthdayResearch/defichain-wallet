import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundConnectionStatus } from '@screens/PlaygroundNavigator/components/PlaygroundStatus'

export function PlaygroundUTXO (): JSX.Element {
  const { wallet } = useWalletContext()
  const {
    api,
    rpc
  } = usePlaygroundContext()
  const [status, setStatus] = useState<PlaygroundConnectionStatus>(PlaygroundConnectionStatus.loading)

  useEffect(() => {
    api.wallet.balances().then(() => {
      setStatus(PlaygroundConnectionStatus.online)
    }).catch(() => {
      setStatus(PlaygroundConnectionStatus.error)
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
          online: status === PlaygroundConnectionStatus.online,
          loading: status === PlaygroundConnectionStatus.loading,
          error: status === PlaygroundConnectionStatus.error
        }}
        title='UTXO'
      />

      {status === PlaygroundConnectionStatus.online &&
        (
          <>
            <PlaygroundAction
              onPress={async () => {
                const address = await getActiveAddress()
                await rpc.wallet.sendToAddress(address, 10)
              }}
              testID='playground_wallet_top_up'
              title='Top up 10 DFI UTXO to Wallet'
            />
          </>
        )}
    </View>
  )
}
