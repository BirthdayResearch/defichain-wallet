import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { DFITokenSelector, DFIUtxoSelector, unifiedDFISelector } from '@store/wallet'
import { tailwind } from '@tailwind'

import { ImageBackground } from 'react-native'
import DFIBackground from '@assets/images/DFI_balance_background.png'
import DFIBackgroundDark from '@assets/images/DFI_balance_background_dark.png'
import { IconButton } from '@components/IconButton'
import { ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { BalanceText } from './BalanceText'
import { InfoTextLink } from '@components/InfoTextLink'

export function DFIBalanceCard (): JSX.Element {
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const DFIIcon = getNativeIcon('_UTXO')
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-2 mb-4 rounded-lg flex-1')}
      testID='dfi_balance_card'
    >
      <ImageBackground
        source={isLight ? DFIBackground : DFIBackgroundDark}
        style={tailwind('flex-1 rounded-lg overflow-hidden')}
        resizeMode='cover'
        resizeMethod='scale'
      >
        <View style={tailwind('flex-col flex-1 mx-4 mt-5 mb-4')}>
          <View style={tailwind('flex-row')}>
            <View>
              <View style={tailwind('flex-row mb-3 items-center')}>
                <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
                <ThemedText style={tailwind('pr-9 text-lg font-bold')} testID='total_dfi_label'>DFI</ThemedText>
              </View>

              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind('pr-14 text-sm pb-1.5')}
                testID='dfi_utxo_label'
              >
                UTXO
              </ThemedText>

              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind('pr-12 text-sm')}
                testID='dfi_token_label'
              >
                Token
              </ThemedText>
            </View>

            <View style={tailwind('pt-0.5')}>
              <NumberFormat
                value={DFIUnified.amount}
                thousandSeparator
                decimalScale={8}
                fixedDecimalScale
                displayType='text'
                renderText={value =>
                  <BalanceText
                    testID='total_dfi_amount'
                    style={tailwind('pb-3.5')}
                    symbol='DFI'
                    value={value}
                  />}
              />

              <NumberFormat
                value={DFIUtxo.amount}
                thousandSeparator
                decimalScale={8}
                fixedDecimalScale
                displayType='text'
                renderText={value =>
                  <BalanceText
                    light={tailwind('text-gray-500')}
                    dark={tailwind('text-gray-400')}
                    style={tailwind('text-sm pb-1.5')}
                    testID='dfi_utxo_amount'
                    value={value}
                  />}
              />

              <NumberFormat
                value={DFIToken.amount}
                thousandSeparator
                decimalScale={8}
                fixedDecimalScale
                displayType='text'
                renderText={value =>
                  <BalanceText
                    light={tailwind('text-gray-500')}
                    dark={tailwind('text-gray-400')}
                    style={tailwind('text-sm')}
                    testID='dfi_token_amount'
                    value={value}
                  />}
              />
            </View>
          </View>

          <View style={tailwind('flex-row')}>
            <InfoTextLink
              onPress={() => navigation.navigate('TokensVsUtxo')}
              text='Learn more about UTXO and Token'
              containerStyle={tailwind('w-9/12')}
              testId='token_vs_utxo_info'
            />
            <View style={tailwind('flex-row flex-grow justify-end')}>
              <IconButton
                iconName='swap-vert'
                iconSize={24}
                iconType='MaterialIcons'
                onPress={() => navigation.navigate({
                  name: 'Convert',
                  params: { mode: 'utxosToAccount' },
                  merge: true
                })}
                testID='convert_dfi_button'
                style={tailwind('mr-2')}
              />
              <IconButton
                iconName='arrow-upward'
                iconSize={24}
                iconType='MaterialIcons'
                onPress={() => navigation.navigate({
                  name: 'Send',
                  params: { token: DFIUnified },
                  merge: true
                })}
                testID='send_dfi_button'
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </ThemedView>
  )
}
