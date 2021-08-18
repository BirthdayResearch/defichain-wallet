import * as React from 'react'
import { View } from 'react-native'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { getEnvironment } from '../../../../../environment'
import { translate } from '../../../../../translations'
import { RowNetworkItem } from '../components/RowNetworkItem'

export function NetworkSelectionScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <View testID='network_selection_screen'>
      <SectionTitle
        text={translate('screens/NetworkSelectionScreen', 'NETWORK')}
        testID='network_selection_screen_title'
      />
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
    </View>
  )
}
