import React, { useEffect, useState } from 'react'
import tailwind from 'tailwind-rn'
import { getPlaygroundApiClient } from '../../../app/api/playground'
import { EnvironmentNetwork } from '../../../app/environment'
import { Logging } from '../../../app/logging'
import { getNetwork } from '../../../app/storage'
import { Text, View } from '../../../components'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundConnection (): JSX.Element {
  const refresh = 6000
  const apiClient = getPlaygroundApiClient()

  const [count, setCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const [environment, setEnvironment] = useState<EnvironmentNetwork | undefined>(undefined)

  useEffect(() => {
    getNetwork().then(network => {
      setEnvironment(network)
    }).catch(Logging.error)

    const interval = setInterval(() => {
      apiClient.playground.info().then(({ block }) => {
        setCount(block.count)
        setConnected(true)
      }).catch(() => {
        setConnected(false)
      })
    }, refresh)
    return () => clearInterval(interval)
  }, [])

  return (
    <View>
      <View style={tailwind('flex flex-row items-center')}>
        <Text style={tailwind('text-2xl font-bold')}>Connection</Text>
        <View style={tailwind('flex-row items-center ml-2')}>
          <PlaygroundStatus online={connected} offline={!connected} />
          <Text style={tailwind('ml-2 text-gray-900')}>↻{(refresh / 1000).toFixed(0)}s</Text>
        </View>
      </View>

      <View style={tailwind('mt-1')}>
        <Text style={tailwind('text-sm font-medium text-gray-900')}>
          Playground: {environment}
        </Text>

        <Text style={tailwind('mt-1 text-sm font-medium text-gray-900')}>
          Block Count: {count === 0 ? '...' : count}
        </Text>
      </View>
    </View>
  )
}
