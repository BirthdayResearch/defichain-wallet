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
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import BigNumber from 'bignumber.js'

export function DFIBalanceCard (): JSX.Element {
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { getTokenPrice } = useTokenPrice()
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const usdAmount = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount), DFIUnified.isLPS)
  const DFIIcon = getNativeIcon('_UTXO')
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-4 mb-1.5 rounded-lg flex-1')}
      testID='dfi_balance_card'
    >
      <ImageBackground
        source={isLight ? DFIBackground : DFIBackgroundDark}
        style={tailwind('flex-1 rounded-lg overflow-hidden')}
        resizeMode='cover'
        resizeMethod='scale'
      >
        <View style={tailwind('flex-col flex-1 m-4')}>
          <ThemedView
            dark={tailwind('border-b border-gray-700')}
            light={tailwind('border-b border-gray-100')}
            style={tailwind('flex-row mb-3 pb-3 justify-between')}
          >
            <View style={tailwind('flex-row items-center')}>
              <DFIIcon width={32} height={32} />
              <TokenNameText displaySymbol='DFI' name='DeFiChain' testID='total_dfi_label' />
            </View>

            {
              hasFetchedToken
                ? (
                  <TokenAmountText
                    tokenAmount={DFIUnified.amount} usdAmount={usdAmount} testID='dfi_total_balance'
                    isBalancesDisplayed={isBalancesDisplayed}
                  />
                )
                : (
                  <View style={tailwind('pt-1')}>
                    <View style={tailwind('mb-1.5')}>
                      <TextSkeletonLoader
                        iContentLoaderProps={{
                          width: '150',
                          height: '16',
                          testID: 'dfi_balance_skeleton_loader'
                        }}
                        textHorizontalOffset='30'
                        textWidth='120'
                      />
                    </View>
                    <View>
                      <TextSkeletonLoader
                        iContentLoaderProps={{
                          width: '150',
                          height: '12',
                          testID: 'dfi_USD_balance_skeleton_loader'
                        }}
                        textHorizontalOffset='30'
                        textWidth='120'
                      />
                    </View>
                  </View>
                )
            }
          </ThemedView>

          <DFIBreakdownRow testID='dfi_utxo' amount={DFIUtxo.amount} label='UTXO' hasFetchedToken={hasFetchedToken} />
          <DFIBreakdownRow testID='dfi_token' amount={DFIToken.amount} label='Token' hasFetchedToken={hasFetchedToken} />

          <View style={tailwind('flex-row mt-2')}>
            <InfoTextLink
              onPress={() => navigation.navigate('TokensVsUtxo')}
              text='Learn more about DFI'
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

export function DFIBreakdownRow ({
  amount,
  label,
  testID,
  hasFetchedToken
}: { amount: string, label: string, testID: string, hasFetchedToken: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex-row flex-1 items-center')}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('pr-14 text-sm pb-1.5')}
        testID={`${testID}_label`}
      >
        {label}
      </ThemedText>
      <View style={tailwind('flex-row flex-1 justify-end')}>
        {
          hasFetchedToken
            ? (
              <NumberFormat
                value={amount}
                thousandSeparator
                decimalScale={8}
                fixedDecimalScale
                displayType='text'
                renderText={value =>
                  <BalanceText
                    light={tailwind('text-gray-500')}
                    dark={tailwind('text-gray-400')}
                    style={tailwind('text-sm pb-1.5')}
                    testID={`${testID}_amount`}
                    value={value}
                  />}
              />
            )
            : (
              <View style={tailwind('mb-1')}>
                <TextSkeletonLoader
                  iContentLoaderProps={{
                    width: '210',
                    height: '14',
                    testID: 'dfi_breakdown_row_skeleton_loader'
                  }}
                  textHorizontalOffset='90'
                  textWidth='120'
                />
              </View>
            )
        }
      </View>
    </View>
  )
}
