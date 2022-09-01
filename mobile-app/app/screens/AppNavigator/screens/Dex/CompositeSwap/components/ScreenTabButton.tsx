import { tailwind } from '@tailwind'
import { ThemedViewV2 } from '@components/themed'
import { View } from 'react-native'
import { ButtonGroupV2 } from '../../components/ButtonGroupV2'
import { ButtonGroupTabKey } from '../CompositeSwapScreenV2'
import { translate } from '@translations'

interface ScreenTabButtonProps {
    activeButtonGroup: ButtonGroupTabKey
    onPress: (type: ButtonGroupTabKey) => void
}

export function ScreenTabButton ({ activeButtonGroup, onPress }: ScreenTabButtonProps): JSX.Element {
    const buttonGroup = [
        {
          id: ButtonGroupTabKey.InstantSwap,
          label: translate('screens/CompositeSwapScreen', 'Instant'),
          handleOnPress: () => onPress(ButtonGroupTabKey.InstantSwap)
        },
        {
          id: ButtonGroupTabKey.FutureSwap,
          label: translate('screens/CompositeSwapScreen', 'Future'),
          handleOnPress: () => onPress(ButtonGroupTabKey.FutureSwap)
        }
      ]
    return (
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-100')}
        dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-100')}
        style={tailwind('flex flex-col items-center pt-4 rounded-b-2xl border-b')}
      >
        <View style={tailwind('w-full px-5')}>
          <ButtonGroupV2
            buttons={buttonGroup}
            activeButtonGroupItem={activeButtonGroup}
            testID='swap_tabs'
            lightThemeStyle={tailwind('bg-transparent')}
            darkThemeStyle={tailwind('bg-transparent')}
          />
        </View>
      </ThemedViewV2>
    )
}
