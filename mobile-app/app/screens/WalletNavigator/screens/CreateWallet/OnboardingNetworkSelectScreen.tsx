import { ThemedSectionTitle } from '@components/themed'
import { getEnvironment } from '@environment'
import { RowNetworkItem } from '@components/RowNetworkItem'
import { translate } from '@translations'
import * as React from 'react'
import { View } from 'react-native'
import * as Updates from 'expo-updates'

export function OnboardingNetworkSelectScreen (): JSX.Element {
  const networks = getEnvironment(Updates.releaseChannel).networks

  return (
    <View testID='onboarding_network_selection_screen'>
      <ThemedSectionTitle
        testID='onboarding_network_selection_screen_title'
        text={translate('screens/OnboardingNetworkSelectScreen', 'SELECT NETWORK')}
      />

      {
        networks.map((network, index) => (
          <RowNetworkItem
            key={index}
            network={network}
            alertMessage={translate(
              'screens/OnboardingNetworkSelectScreen', 'You are about to switch to {{network}}. Do you want to proceed?', { network: network })}
          />
        ))
      }
    </View>
  )
}
