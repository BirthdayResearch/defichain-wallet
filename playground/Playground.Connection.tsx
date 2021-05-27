import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { initializePlayground, PlaygroundState, PlaygroundStatus } from "../store/playground";

export function PlaygroundConnection (): JSX.Element {
  const playground = useSelector<RootState, PlaygroundState>(state => state.playground)
  const dispatch = useDispatch()

  useEffect(() => {
    if (playground.status === PlaygroundStatus.NotConnected) {
      dispatch(initializePlayground())
    }
  })

  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    if (playground.status === PlaygroundStatus.Connected) {
      const interval = setInterval(() => {
        setBlockCount(seconds => seconds + 1);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('font-bold')}>Connection</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatusBadge />
        </View>
      </View>

      <Text style={tailwind('text-xs font-medium')}>
        Provider: {playground.provider}
      </Text>

      <Text style={tailwind('text-xs font-medium')}>
        Block Count: {blockCount}
      </Text>
    </View>
  )
}

function PlaygroundStatusBadge (): JSX.Element {
  const status: PlaygroundStatus = useSelector<RootState, PlaygroundStatus>(state => state.playground.status)

  switch (status) {
    case PlaygroundStatus.NotConnected:
      return <View style={tailwind('h-3 w-3 rounded-full bg-gray-500')} />
    case PlaygroundStatus.Connecting:
      return <View style={tailwind('h-3 w-3 rounded-full bg-blue-500')} />
    case PlaygroundStatus.Connected:
      return <View style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
    case PlaygroundStatus.Failed:
      return <View style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
  }
}

//   connected: boolean
//   status: string

//   provider?: string
//   api?: PlaygroundApiClient
//   rpc?: PlaygroundRpcClient

// TODO(fuxingloh): Display Block Count
