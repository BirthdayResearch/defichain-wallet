import { getEnvironment } from '@environment'
import { translate } from '@translations'
import { getReleaseChannel } from '@api/releaseChannel'
import { ThemedViewV2 } from '@components/themed/ThemedViewV2'
import { tailwind } from '@tailwind'
import { ThemedSectionTitleV2 } from '@components/themed/ThemedSectionTitleV2'
import { NetworkItemRowV2 } from '@components/NetworkItemRowV2'

export function OnboardingNetworkSelectScreenV2 (): JSX.Element {
  const networks = getEnvironment(getReleaseChannel()).networks

  return (
    <ThemedViewV2
      testID='onboarding_network_selection_screen'
      style={tailwind('px-5 flex-1')}
    >
      <ThemedSectionTitleV2
        testID='onboarding_network_selection_screen_title'
        text={translate('screens/OnboardingNetworkSelectScreen', 'NETWORK')}
      />

      <ThemedViewV2
        style={[tailwind('px-5'), { borderRadius: 10 }]}
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
      >
        {
          networks.map((network, index) => (
            <NetworkItemRowV2
              key={index}
              network={network}
              alertMessage={translate(
                'screens/OnboardingNetworkSelectScreen', 'You are about to switch to {{network}}. Do you want to proceed?', { network: network }
              )}
              isLast={index === networks.length - 1}
            />
          ))
        }
      </ThemedViewV2>
    </ThemedViewV2>
  )
}
