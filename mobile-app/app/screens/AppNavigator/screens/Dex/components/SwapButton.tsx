import { ThemedText } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'
import { DexParamList } from '../DexNavigator'

export function SwapButton (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  return (
    <TouchableOpacity
      style={tailwind('pr-4')}
      onPress={() => navigation.navigate({
        name: 'CompositeSwap',
        params: {},
        merge: true
      })}
    >
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('font-medium')}
        testID='composite_swap'
      >
        {translate('screens/DexScreen', 'SWAP')}
      </ThemedText>
    </TouchableOpacity>
  )
}
