import * as React from 'react'
import { View } from 'react-native'
import { getEnvironment } from '../../../../../environment'
import { RowNetworkItem } from '../components/RowNetworkItem'

export function NetworkSelectionScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <View testID='network_selection_screen'>
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
    </View>
  )
}
