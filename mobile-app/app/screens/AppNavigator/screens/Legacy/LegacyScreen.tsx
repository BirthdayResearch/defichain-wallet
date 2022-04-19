import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'

import { StackScreenProps } from '@react-navigation/stack'
import { LegacyParamList } from './LegacyNavigator'
import { translate } from '@translations'
import { View } from '@components'
import { openURL } from '@api/linking'
import { LegacyAppIcon } from '@components/icons/LegacyAppIcon'
import { TouchableOpacity } from 'react-native'

type Props = StackScreenProps<LegacyParamList, 'LegacyScreen'>

export function LegacyScreen ({ navigation }: Props): JSX.Element {
  const handlePress = async (): Promise<void> => {
    /* TODO: Change to the actual link of new defichain app */
    await openURL('https://apps.apple.com/us/app/defichain-wallet/id1572472820')
  }

  return (
    <ThemedView
      testID='legacy_screen'
      style={tailwind('flex-1')}
      dark={tailwind('bg-black')}
    >
      <View style={tailwind('items-center justify-center h-full mx-4')}>
        <ThemedText
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('font-semibold text-2xl')}
        >{translate('LegacyScreen', 'DeFiChain Wallet')}
        </ThemedText>
        <ThemedView
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-900')}
          style={tailwind('px-3 py-1 mb-4 rounded-lg')}
        >
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm font-medium')}
          >{translate('LegacyScreen', 'LEGACY')}
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={tailwind('text-center mb-4')}
        >{translate('LegacyScreen', 'A new, identical DeFiChain Wallet app has been created to replace this app.')}
        </ThemedText>
        <ThemedText
          style={tailwind('text-center')}
        >{translate('LegacyScreen', 'To continue, download the new Wallet on the App Store.')}
        </ThemedText>

        <TouchableOpacity
          style={tailwind('mt-12')}
          onPress={handlePress}
        >
          <LegacyAppIcon />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}
