import { SectionTitle } from '@components/SectionTitle'
import { getEnvironment } from '@environment'
import { RowNetworkItem } from '@components/RowNetworkItem'
import { translate } from '@translations'
import * as React from 'react'
import { View } from 'react-native'

export function OnboardingNetworkSelectScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <View testID='onboarding_network_selection_screen'>
      <SectionTitle
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
