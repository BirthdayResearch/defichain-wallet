import React, { useEffect, useState } from 'react'
import { Logging } from '../../../api'
import { Text, View } from '../../../components'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWhaleApiClient } from '../../../contexts/WhaleContext'
import { isPlayground } from '../../../environment'
import { tailwind } from '../../../tailwind'
import { PlaygroundTitle } from '../components/PlaygroundTitle'

export function PlaygroundConnection (): JSX.Element {
  const { network } = useNetworkContext()
  const api = useWhaleApiClient()

  const [count, setCount] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    function refresh (): void {
      api.stats.get().then(({ count }) => {
        setCount(count.blocks)
        setConnected(true)
      }).catch((err) => {
        setCount(0)
        setConnected(false)
        Logging.error(err)
      })
    }

    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [network])

  return (
    <View>
      <PlaygroundTitle title='Connection' status={{ online: connected, offline: !connected }} />

      <View style={tailwind('px-4 py-4 bg-white')}>
        <Text style={tailwind('font-medium')}>
          Network: <Text testID='playground_active_network'>{network}</Text>
        </Text>
        <Text>
          Blocks: {count === 0 ? '...' : count}
        </Text>

        {isPlayground(network) ? (
          <Text style={tailwind('mt-2 text-sm')}>
            DeFi Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications.
            Assets are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets
            daily.
          </Text>
        ) : null}
      </View>
    </View>
  )
}
