import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import GridBackgroundDark from '@assets/images/onboarding/grid-background-dark.png'
import GridBackgroundLight from '@assets/images/onboarding/grid-background-light.png'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { ImageBackground, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { SwapButton } from './SwapButton'
import { LinearGradient } from 'expo-linear-gradient'

export function TotalValueLocked (props: {tvl: number}): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <LinearGradient
      colors={isLight ? ['#F25FC3', '#8B69EC'] : ['#AA1A7D', '#300FA9']}
      start={[0, 0]}
      end={[1, 1]}
      locations={[0, 1]}
      style={[tailwind('rounded-lg-v2'), { padding: 0.5 }]}
    >
      <ThemedViewV2 style={tailwind('rounded-lg-v2')}>
        <ImageBackground
          source={isLight ? GridBackgroundLight : GridBackgroundDark}
          resizeMode='cover'
          imageStyle={tailwind('h-56')}
          style={tailwind('w-full overflow-hidden rounded-lg-v2')}
        >
          <View style={tailwind('py-3.5 px-5 flex-row items-center justify-between')}>
            <View style={tailwind('w-8/12')}>
              <NumberFormat
                displayType='text'
                prefix='$'
                renderText={(val: string) => (
                  <ThemedTextV2
                    dark={tailwind('text-mono-dark-v2-900')}
                    light={tailwind('text-mono-light-v2-900')}
                    style={tailwind('text-base font-semibold-v2')}
                    testID='DEX_TVL'
                  >
                    {val}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={new BigNumber(props.tvl).decimalPlaces(0, BigNumber.ROUND_DOWN).toString()}
              />
              <ThemedTextV2
                dark={tailwind('text-mono-dark-v2-900')}
                light={tailwind('text-mono-light-v2-900')}
                style={tailwind('text-xs font-normal-v2 ')}
              >
                {translate('screens/DexScreen', 'Total value locked')}
              </ThemedTextV2>
            </View>
            <SwapButton />
          </View>
        </ImageBackground>
      </ThemedViewV2>
    </LinearGradient>
  )
}
