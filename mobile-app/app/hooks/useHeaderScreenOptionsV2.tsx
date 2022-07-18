import { StackNavigationOptions } from '@react-navigation/stack'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { Dimensions, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'

export function useHeaderScreenOptionsV2 ({ headerNetworkOnPress }: {headerNetworkOnPress: () => void}): StackNavigationOptions {
  const { width } = Dimensions.get('window')
  const { isLight } = useThemeContext()
  const insets = useSafeAreaInsets()

  return {
    headerTitleStyle: tailwind('font-normal-v2 text-xl text-center'),
    headerTitleContainerStyle: { width: width - (Platform.OS === 'ios' ? 200 : 180) },
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerRightContainerStyle: tailwind('pr-5 pb-2'),
    headerLeftContainerStyle: tailwind('pl-5 relative', { 'right-2': Platform.OS === 'ios', 'right-5': Platform.OS !== 'ios' }),
    headerStyle: [tailwind('rounded-b-2xl border-b', { 'bg-mono-light-v2-00 border-mono-light-v2-100': isLight, 'bg-mono-dark-v2-00 border-mono-dark-v2-100': !isLight }), { height: 76 + insets.top }],
    headerBackgroundContainerStyle: tailwind({ 'bg-mono-light-v2-100': isLight, 'bg-mono-dark-v2-100': !isLight }),
    headerRight: () => (
      <HeaderNetworkStatus onPress={headerNetworkOnPress} />
    )
  }
}
