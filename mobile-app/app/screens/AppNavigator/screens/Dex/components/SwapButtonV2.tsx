import { NavigationProp, useNavigation } from '@react-navigation/native'
import { DexParamList } from '@screens/AppNavigator/screens/Dex/DexNavigator'
import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { translate } from '@translations'

export function SwapButtonV2 (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  return (
    <ThemedTouchableOpacityV2
      style={tailwind('rounded-2xl-v2 py-2 px-4')}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
      onPress={() => navigation.navigate({
        name: 'CompositeSwap',
        params: {},
        merge: true
      })}
    >
      <ThemedTextV2
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
        style={tailwind('font-semibold-v2 text-xs')}
        testID='composite_swap'
      >
        {translate('screens/DexScreen', 'Swap')}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
