import * as React from 'react'
import { View } from 'react-native'
import { ThemedSectionTitle } from '../../../../../components/themed/ThemedSectionTitle'
import { getEnvironment } from '../../../../../environment'
import { translate } from '../../../../../translations'
import { RowNetworkItem } from '../../../../../components/RowNetworkItem'

export function NetworkSelectionScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <View testID='network_selection_screen'>
      <ThemedSectionTitle
        testID='network_selection_screen_title'
        text={translate('screens/NetworkSelectionScreen', 'NETWORK')}
      />

      {
        networks.map((network, index) => (
          <RowNetworkItem
            key={index}
            network={network}
            alertMessage={translate(
              'screens/Settings', 'You are about to switch to {{network}}. If there is no existing wallet on this network, you will be redirected to Onboarding screen. Do you want to proceed?', { network: network })}
          />
        ))
      }
    </View>
  )
}
