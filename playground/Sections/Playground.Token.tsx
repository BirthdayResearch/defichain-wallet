import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React, { useEffect, useState } from 'react'
import { usePlaygroundRpcClient } from '../../hooks/api/usePlaygroundClient'
import { PlaygroundRpcClient } from '@defichain/playground-api-client'
import { TokenInfo } from '@defichain/jellyfish-api-core/dist/category/token'
import { PlaygroundAction } from '../Playground.Action'
import { PlaygroundStatus } from '../Playground.Status'

export function PlaygroundToken (): JSX.Element {
  const rpcClient = usePlaygroundRpcClient()
  const [status, setStatus] = useState<string>('loading')
  const [tokens, setTokens] = useState<PlaygroundTokenInfo[]>([])

  useEffect(() => {
    getTokens(rpcClient).then(value => {
      setTokens(value)
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [])

  function topUp100 (token: PlaygroundTokenInfo): void {
    // TODO(fuxingloh):
  }

  const actions = tokens.map(token => {
    return (
      <PlaygroundAction
        key={token.id}
        testID={`playground_token_${token.symbol}`}
        title={`Top up 100.0 ${token.symbol} to your Wallet`}
        onPress={() => {
          topUp100(token)
        }}
      />
    )
  })

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-lg font-bold')}>Token</Text>
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

// TODO(fuxingloh): top up

export type PlaygroundTokenInfo = TokenInfo & { id: string }

async function getTokens (rpcClient: PlaygroundRpcClient): Promise<PlaygroundTokenInfo[]> {
  const result = await rpcClient.token.listTokens()

  return Object.entries(result).map(([id, info]) => {
    return { id, ...info }
  }).sort(a => Number.parseInt(a.id))
}
