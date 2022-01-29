import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from './themed'

type SubHeadingType = 'Status' | 'NetworkSelect'

interface HeaderTitleProps {
  text?: string
  subHeadingType?: SubHeadingType
  testID?: string
  containerTestID?: string
  onPress?: () => void
  disabled?: boolean
  children?: JSX.Element
}

export function HeaderTitle ({
  text,
  subHeadingType = 'Status',
  testID,
  onPress,
  disabled,
  containerTestID,
  children
}: HeaderTitleProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  const goToNetworkDetails = (): void => {
    navigation.navigate('NetworkDetails')
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress ?? goToNetworkDetails}
      testID={containerTestID}
      style={tailwind(`flex-col ${Platform.OS === 'ios' ? 'items-center' : ''}`)}
    >
      {text !== undefined &&
        <>
          <ThemedText
            dark={tailwind('text-white text-opacity-90')}
            light={tailwind('text-black')}
            style={tailwind('font-semibold leading-5 text-center')}
            testID={testID}
          >
            {text}
          </ThemedText>

          {subHeadingType === 'Status' && <ConnectionStatus />}
          {subHeadingType === 'NetworkSelect' && <HeaderNetworkSelect />}
        </>}
      {children}
    </TouchableOpacity>
  )
}

export function ConnectionStatus (): JSX.Element {
  const { network } = useNetworkContext()
  const connected = useSelector((state: RootState) => state.block.connected)
  return (
    <View style={tailwind('flex-row items-center justify-center')}>
      <View
        style={tailwind(`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`)}
        testID='header_status_indicator'
      />
      <View style={tailwind('h-full')}>
        <ThemedText
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
          style={tailwind('text-xs font-semibold leading-4')}
          testID='header_active_network'
        >
          {network}
        </ThemedText>
      </View>
    </View>
  )
}

function HeaderNetworkSelect (): JSX.Element {
  const { network } = useNetworkContext()

  return (
    <View style={tailwind('flex-row items-center')}>
      <ThemedIcon
        iconType='MaterialIcons'
        name='wifi-tethering'
        size={16}
        style={tailwind('mr-1.5')}
        dark={tailwind('text-white text-opacity-70')}
        light={tailwind('text-gray-600')}
      />

      <View style={tailwind('h-full')}>
        <ThemedText
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
          style={tailwind('text-xs font-semibold leading-4')}
          testID='header_active_network'
        >
          {network}
        </ThemedText>
      </View>
    </View>
  )
}
