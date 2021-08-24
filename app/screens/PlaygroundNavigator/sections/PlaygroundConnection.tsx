import React from 'react'
import { useSelector } from 'react-redux'
import { Text, View } from '../../../components'
import { ThemedText, ThemedView } from '../../../components/themed'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { isPlayground } from '../../../environment'
import { RootState } from '../../../store'
import { tailwind } from '../../../tailwind'
import { PlaygroundTitle } from '../components/PlaygroundTitle'

export function PlaygroundConnection (): JSX.Element {
  const { network } = useNetworkContext()
  const connected = useSelector((state: RootState) => state.block.connected)
  const count = useSelector((state: RootState) => state.block.count)

  return (
    <View>
      <PlaygroundTitle title='Connection' status={{ online: connected, offline: !connected }} />

      <ThemedView style={tailwind('px-4 py-4')} light='bg-white' dark='bg-darksurface'>
        <Text>
          <ThemedText style={tailwind('font-medium')}>
            Network:
          </ThemedText>
          <ThemedText
            testID='playground_active_network'
          > {network}
          </ThemedText>
        </Text>
        <ThemedText>Blocks: {count === 0 ? '...' : count}</ThemedText>
        {
          isPlayground(network) && (
            <ThemedText style={tailwind('mt-2 text-sm')}>
              DeFi Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications.
              Assets are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets
              daily.
            </ThemedText>
          )
        }
      </ThemedView>
    </View>
  )
}
