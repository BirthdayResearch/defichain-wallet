import { TokenInfo } from '@defichain/jellyfish-api-core/dist/category/token'
import { PlaygroundRpcClient } from '@defichain/playground-api-client'
import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { usePlaygroundContext } from '@contexts/PlaygroundContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundConnectionStatus } from '@screens/PlaygroundNavigator/components/PlaygroundStatus'

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

  const actions = tokens.filter(({ symbol }) => symbol !== 'DFI').map(token => {
    return (
      <PlaygroundAction
        key={token.id}
        onPress={async () => {
          const address = await getActiveAddress()
          await rpc.call('sendtokenstoaddress', [{}, {
            [address]: `10@${token.symbol}`
          }], 'number')
        }}
        testID={`playground_token_${token.symbol}`}
        title={`Top up 10.0 ${token.symbol} to Wallet`}
      />
    )
  })

  return (
    <View>
      <PlaygroundTitle
        status={{
          online: status === PlaygroundConnectionStatus.online,
          loading: status === PlaygroundConnectionStatus.loading,
          error: status === PlaygroundConnectionStatus.error
        }}
        title='Token'
      />

      <PlaygroundAction
        key='0'
        onPress={async () => {
          await api.wallet.sendTokenDfiToAddress({
            amount: '10',
            address: await getActiveAddress()
          })
        }}
        testID='playground_token_DFI'
        title='Top up 10.0 DFI to Wallet'
      />

      {actions}
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
