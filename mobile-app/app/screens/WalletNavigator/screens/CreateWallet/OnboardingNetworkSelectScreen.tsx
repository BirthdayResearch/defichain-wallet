import { ThemedSectionTitle } from '@components/themed'
import { getEnvironment } from '@environment'
import { RowNetworkItem } from '@components/RowNetworkItem'
import { translate } from '@translations'
import { View } from 'react-native'
import { getReleaseChannel } from '@api/releaseChannel'

export function OnboardingNetworkSelectScreen (): JSX.Element {
  const networks = getEnvironment(getReleaseChannel()).networks

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
