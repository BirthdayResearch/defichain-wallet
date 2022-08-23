import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { PlaygroundTitle } from '../components/PlaygroundTitle'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundConnectionStatus, PlaygroundStatusType } from '@screens/PlaygroundNavigator/components/PlaygroundStatus'
import { ThemedViewV2, ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { PlaygroundAction } from '../components/PlaygroundAction'

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
  const dataLists = [
    {
      title: 'Add 10 DFI UTXO to wallet',
      onPress: async (): Promise<void> => {
        const address = await getActiveAddress()
        await rpc.wallet.sendToAddress(address, 10)
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            iconType='Feather'
            name='plus-circle'
            size={18}
          />
        )
      },
      testID: 'playground_wallet_top_up'
    }
  ]

  return (
    <View>
      <PlaygroundTitle
        status={{
          online: status === PlaygroundConnectionStatus.online,
          loading: status === PlaygroundConnectionStatus.loading,
          error: status === PlaygroundConnectionStatus.error,
          type: PlaygroundStatusType.secondary
        }}
        title='UTXO'
      />

      {status === PlaygroundConnectionStatus.online &&
        <ThemedViewV2
          dark={tailwind('bg-mono-dark-v2-00')}
          light={tailwind('bg-mono-light-v2-00')}
          style={tailwind('rounded-lg-v2 px-5')}
        >
          {
            dataLists.map((dataList, index) => (
              <PlaygroundAction
                key={index}
                // eslint-disable-next-line react/jsx-handler-names
                onPress={dataList.onPress}
                title={dataList.title}
                rhsChildren={dataList.rhsChildren}
                isLast={index === dataLists.length - 1}
                testID={dataList.testID}
              />
            ))
          }
        </ThemedViewV2>}
    </View>
  )
}
