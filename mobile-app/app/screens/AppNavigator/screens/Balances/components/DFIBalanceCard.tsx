import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { DFITokenSelector, DFIUtxoSelector, unifiedDFISelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { ImageBackground, TextProps, StyleProp, ViewProps } from 'react-native'
import DFIBackground from '@assets/images/DFI_balance_bg_gradient.png'
import DFIBackgroundDark from '@assets/images/DFI_balance_bg_gradient_dark.png'
import { IconButton } from '@components/IconButton'
import { ThemedProps, ThemedText, ThemedView } from '@components/themed'
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
import { TokenBreakdownPercentage } from './TokenBreakdownPercentage'
import { useState } from 'react'
import { translate } from '@translations'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'

export function DFIBalanceCard (): JSX.Element {
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { getTokenPrice } = useTokenPrice()
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const lockedToken = useTokenLockedBalance({ symbol: 'DFI' }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const usdAmount = getTokenPrice(DFIUnified.symbol, lockedToken.amount.plus(DFIUnified.amount), DFIUnified.isLPS)
  const DFIIcon = getNativeIcon('_UTXO')
  const { isLight } = useThemeContext()
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false)
  const onBreakdownPress = (): void => {
    setIsBreakdownExpanded(!isBreakdownExpanded)
  }

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-4 mb-1.5 rounded-lg flex-1')}
      testID='dfi_balance_card'
    >
      <View style={tailwind('flex-col flex-1')}>
        <ImageBackground
          source={isLight ? DFIBackground : DFIBackgroundDark}
          style={tailwind('flex-1 rounded-lg overflow-hidden')}
          resizeMode='cover'
          resizeMethod='scale'
        >
          <View style={tailwind('flex-row m-4 mb-2 justify-between')}>
            <View style={tailwind('flex-row items-center')}>
              <DFIIcon width={32} height={32} />
              <TokenNameText displaySymbol='DFI' name='DeFiChain' testID='total_dfi_label' />
            </View>

            {
              hasFetchedToken
                ? (
                  <TokenAmountText
                    tokenAmount={lockedToken.amount.plus(DFIUnified.amount).toFixed(8)} usdAmount={usdAmount} testID='dfi_total_balance'
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
          </View>
          <View style={tailwind('mx-4')}>
            <TokenBreakdownPercentage
              symbol='DFI'
              availableAmount={new BigNumber(DFIUnified.amount)}
              onBreakdownPress={onBreakdownPress}
              isBreakdownExpanded={isBreakdownExpanded}
              lockedAmount={lockedToken.amount}
            />
          </View>
        </ImageBackground>

        {isBreakdownExpanded && (
          <ThemedView
            light={tailwind('border-t border-gray-100')}
            dark={tailwind('border-t border-gray-700')}
            style={tailwind('mx-4 mb-4 pt-2')}
          >
            <DFIBreakdown
              lockedAmount={lockedToken.amount}
              hasFetchedToken={hasFetchedToken}
              dfiUnified={DFIUnified}
              dfiUtxo={DFIUtxo}
              dfiToken={DFIToken}
            />
            <DFIBreakdownAction dfiUnified={DFIUnified} />
          </ThemedView>
        )}
      </View>
    </ThemedView>
  )
}

interface DFIBreakdownProps {
  lockedAmount: BigNumber
  hasFetchedToken: boolean
  dfiUnified: WalletToken
  dfiUtxo: WalletToken
  dfiToken: WalletToken
}

function DFIBreakdown (props: DFIBreakdownProps): JSX.Element {
  return (
    <>
      <DFIBreakdownRow
        testID='dfi_locked'
        amount={props.lockedAmount.toFixed(8)}
        label='Locked in vault(s)'
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind('font-medium')}
        valueThemeProps={{
          light: tailwind('text-black'),
          dark: tailwind('text-white')
        }}
        containerStyle={tailwind('mb-3.5')}
      />
      <DFIBreakdownRow
        testID='dfi_available'
        amount={props.dfiUnified.amount}
        label='Available'
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind('font-medium')}
        valueThemeProps={{
          light: tailwind('text-black'),
          dark: tailwind('text-white')
        }}
        containerStyle={tailwind('mb-1.5')}
      />
      <DFIBreakdownRow testID='dfi_utxo' amount={props.dfiUtxo.amount} label='as UTXO' hasFetchedToken={props.hasFetchedToken} containerStyle={tailwind('mb-1')} />
      <DFIBreakdownRow testID='dfi_token' amount={props.dfiToken.amount} label='as Token' hasFetchedToken={props.hasFetchedToken} />
    </>
  )
}

interface DFIBreakdownRowProps {
  amount: string
  label: string
  testID: string
  hasFetchedToken: boolean
  labelTextStyle?: StyleProp<TextProps>
  valueTextStyle?: StyleProp<TextProps>
  valueThemeProps?: ThemedProps
  containerStyle?: StyleProp<ViewProps>
}
function DFIBreakdownRow ({
  amount,
  label,
  testID,
  hasFetchedToken,
  labelTextStyle,
  valueTextStyle,
  valueThemeProps = {
    light: tailwind('text-gray-500'),
    dark: tailwind('text-gray-400')
  },
  containerStyle
}: DFIBreakdownRowProps): JSX.Element {
  return (
    <View style={[tailwind('flex-row flex-1 items-center'), containerStyle]}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={[tailwind('pr-14 text-sm'), labelTextStyle]}
        testID={`${testID}_label`}
      >
        {translate('components/DFIBalanceCard', label)}
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
                    light={valueThemeProps.light}
                    dark={valueThemeProps.dark}
                    style={[tailwind('text-sm'), valueTextStyle]}
                    testID={`${testID}_amount`}
                    value={value}
                  />}
              />
            )
            : (
              <TextSkeletonLoader
                iContentLoaderProps={{
                  width: '150',
                  height: '14',
                  testID: 'dfi_breakdown_row_skeleton_loader'
                }}
                textHorizontalOffset='30'
                textWidth='120'
              />
            )
        }
      </View>
    </View>
  )
}

function DFIBreakdownAction ({ dfiUnified }: { dfiUnified: WalletToken }): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  return (
    <View style={tailwind('flex-row mt-4')}>
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
            params: { token: dfiUnified },
            merge: true
          })}
          testID='send_dfi_button'
        />
      </View>
    </View>
  )
}
