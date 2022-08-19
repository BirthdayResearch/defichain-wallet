import { TokenInfo } from '@defichain/jellyfish-api-core/dist/category/token'
import { PlaygroundRpcClient } from '@defichain/playground-api-client'
import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundConnectionStatus, PlaygroundStatusType } from '@screens/PlaygroundNavigator/components/PlaygroundStatus'
import { ThemedIcon, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'

export function PlaygroundToken (): JSX.Element | null {
  const { wallet } = useWalletContext()
  const {
    rpc,
    api
  } = usePlaygroundContext()
  const [status, setStatus] = useState<PlaygroundConnectionStatus>(PlaygroundConnectionStatus.loading)
  const [tokens, setTokens] = useState<PlaygroundTokenInfo[]>([])

  useEffect(() => {
    getTokens(rpc).then(value => {
      setTokens(value)
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
    <View style={tailwind('pb-28')}>
      <PlaygroundTitle
        status={{
          online: status === PlaygroundConnectionStatus.online,
          loading: status === PlaygroundConnectionStatus.loading,
          error: status === PlaygroundConnectionStatus.error,
          type: PlaygroundStatusType.secondary
        }}
        title='TOKENS'
      />
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-lg-v2 px-5')}
      >
        <PlaygroundAction
          key='0'
          onPress={async () => {
          await api.wallet.sendTokenDfiToAddress({
            amount: '10',
            address: await getActiveAddress()
          })
        }}
          rhsChildren={(): JSX.Element => {
          return (
            <ThemedIcon
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              iconType='Feather'
              name='arrow-down-circle'
              size={18}
            />
          )
        }}
          isLast={false}
          testID='playground_token_DFI'
          title='Add 10 DFI Tokens to wallet'
        />

        {tokens.filter(({ symbol }) => symbol !== 'DFI').map((token, index) => (
          <PlaygroundAction
            key={token.id}
            onPress={async () => {
            const address = await getActiveAddress()
              await rpc.call('sendtokenstoaddress', [{}, {
                [address]: `10@${token.symbol}`
              }], 'number')
            }}
            title={`Add 10 ${token.symbol} to wallet`}
            isLast={index === tokens.length - 2}
            rhsChildren={(): JSX.Element => {
              return (
                <ThemedIcon
                  light={tailwind('text-mono-light-v2-700')}
                  dark={tailwind('text-mono-dark-v2-700')}
                  iconType='Feather'
                  name='arrow-down-circle'
                  size={18}
                />
              )
            }}
            testID={`playground_token_${token.symbol}`}
          />
      ))}
      </ThemedViewV2>
    </View>
  )
}

export type PlaygroundTokenInfo = TokenInfo & { id: string }

async function getTokens (rpcClient: PlaygroundRpcClient): Promise<PlaygroundTokenInfo[]> {
  const result = await rpcClient.token.listTokens()

  return Object.entries(result).map(([id, info]) => {
    return { id, ...info }
  }).sort(a => Number.parseInt(a.id))
}
