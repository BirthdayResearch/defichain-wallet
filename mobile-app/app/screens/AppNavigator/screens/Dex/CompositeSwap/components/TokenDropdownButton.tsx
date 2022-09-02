import { ThemedIcon, ThemedTouchableOpacityV2, ThemedTextV2 } from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function TokenDropdownButton (props: { symbol?: string, onPress: () => void }): JSX.Element {
    const Icon = getNativeIcon(props.symbol ?? '')
    return (
      <ThemedTouchableOpacityV2
        onPress={props.onPress}
        testID='token_select_button'
        dark={tailwind('bg-mono-dark-v2-00 text-mono-dark-v2-500', {
            // 'opacity-30': props.disabled,
            // 'opacity-100': !props.disabled
          })}
        light={tailwind('bg-mono-light-v2-00 text-mono-light-v2-500', {
            // 'opacity-30': props.disabled,
            // 'opacity-100': !props.disabled
          })}
        style={tailwind('flex flex-row items-center rounded-xl-v2 px-3 py-2.5')}
        // disabled={props.disabled}
      >
        {props.symbol === undefined &&
          <ThemedTextV2
            dark={tailwind('text-mono-dark-v2-500')}
            light={tailwind('text-mono-light-v2-500')}
            style={tailwind('text-sm leading-6 font-normal-v2 mr-3.5')}
          >
            {translate('screens/CompositeSwapScreen', 'Select token')}
          </ThemedTextV2>}
        {props.symbol !== undefined &&
          <>
            <Icon testID='tokenA_icon' height={24} width={24} />
            <ThemedTextV2
              style={tailwind('ml-2 mr-3.5 text-sm font-semibold-v2')}
              dark={tailwind({
                  // 'text-gray-200': !props.disabled,
                  // 'text-gray-400': props.disabled
                })}
              light={tailwind({
                  // 'text-gray-900': !props.disabled,
                  // 'text-gray-500': props.disabled
                })}
            >{props.symbol}
            </ThemedTextV2>
          </>}
        <ThemedIcon
          iconType='Feather'
          name='chevron-down'
          size={18}
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
        />
      </ThemedTouchableOpacityV2>
    )
  }
