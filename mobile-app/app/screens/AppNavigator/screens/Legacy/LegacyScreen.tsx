import { Image, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'

import { StackScreenProps } from '@react-navigation/stack'
import { LegacyParamList } from './LegacyNavigator'
import { translate } from '@translations'
import { View } from '@components'
import { openURL } from '@api/linking'
import { DownloadAppleIcon } from '@components/icons/DownloadAppleIcon'
import LegacyIcon from '@assets/images/legacy-icon.png'

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
      light={tailwind('bg-white')}
      dark={tailwind('bg-black')}
    >
      <View style={tailwind('items-center justify-center h-full mx-4')}>
        <ThemedView
          style={tailwind('p-4 rounded-full')}
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-100')}
        >
          <Image
            source={LegacyIcon}
            style={tailwind('h-14 w-14')}
          />
        </ThemedView>
        <ThemedText
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('font-semibold text-2xl mt-6')}
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
          style={tailwind('mt-6')}
          onPress={handlePress}
        >
          <DownloadAppleIcon />
        </TouchableOpacity>
        <ThemedView
          style={tailwind('px-8 py-2 mt-16 flex flex-row rounded')}
          light={tailwind('bg-gray-50')}
          dark={tailwind('bg-gray-900')}
        >
          <ThemedText
            style={tailwind('text-sm')}
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
          >{`${translate('LegacyScreen', 'To find out why we are doing this,')} `}
          </ThemedText>
          <ThemedText
            style={tailwind('text-sm')}
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
          >{translate('LegacyScreen', 'read here.')}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  )
}
