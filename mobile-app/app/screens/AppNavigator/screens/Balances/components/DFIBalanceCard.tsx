import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { DFITokenSelector, DFIUtxoSelector, unifiedDFISelector } from '@store/wallet'
import { tailwind } from '@tailwind'
import { ImageBackground, TouchableOpacity } from 'react-native'
import DFIBackground from '@assets/images/DFI_balance_bg_gradient.png'
import DFIBackgroundDark from '@assets/images/DFI_balance_bg_gradient_dark.png'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'
import { TokenBreakdownDetails } from './TokenBreakdownDetails'
import NumberFormat from 'react-number-format'
import { BalanceText } from './BalanceText'
interface DFIBalaceCardProps {
  denominationCurrency: string
}

export function DFIBalanceCard ({ denominationCurrency }: DFIBalaceCardProps): JSX.Element {
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { getTokenPrice } = useTokenPrice(denominationCurrency) // input based on selected denomination from portfolio tab
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const lockedToken = useTokenLockedBalance({ displaySymbol: 'DFI', denominationCurrency }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const usdAmount = getTokenPrice(DFIUnified.symbol, lockedToken.amount.plus(DFIUnified.amount), DFIUnified.isLPS)
  const availableValue = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount))
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
          <View style={tailwind('flex-row m-4 justify-between')}>
            <View style={tailwind('flex-row items-center')}>
              <DFIIcon width={32} height={32} />
              <TokenNameText displaySymbol='DFI' name='DeFiChain' testID='total_dfi_label' />
            </View>

            {
              hasFetchedToken
                ? (
                  <TokenAmountText
                    tokenAmount={lockedToken.amount.plus(DFIUnified.amount).toFixed(8)}
                    usdAmount={usdAmount}
                    testID='dfi_total_balance'
                    isBalancesDisplayed={isBalancesDisplayed}
                    denominationCurrency={denominationCurrency}
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
          <View style={tailwind('mx-4 mb-4 flex-row items-center')}>
            <DFIBreakdownPercentage
              dfiUtxoPercent={new BigNumber(DFIUtxo.amount).div(DFIUnified.amount).multipliedBy(100)}
              dfiTokenPercent={new BigNumber(DFIToken.amount).div(DFIUnified.amount).multipliedBy(100)}
            />
            <DFIBreakdownAction onBreakdownPress={onBreakdownPress} isBreakdownExpanded={isBreakdownExpanded} />
          </View>
        </ImageBackground>

        {isBreakdownExpanded && (
          <ThemedView
            light={tailwind('border-t border-gray-100')}
            dark={tailwind('border-t border-gray-700')}
            style={tailwind('mx-4 mb-4 pt-4')}
          >
            <TokenBreakdownDetails
              hasFetchedToken={hasFetchedToken}
              lockedAmount={lockedToken.amount}
              lockedValue={lockedToken.tokenValue}
              availableAmount={new BigNumber(DFIUnified.amount)}
              availableValue={availableValue}
              testID='dfi'
              dfiUtxo={DFIUtxo}
              dfiToken={DFIToken}
              denominationCurrency={denominationCurrency}
            />

          </ThemedView>
        )}
      </View>
    </ThemedView>
  )
}

function DFIBreakdownPercentage ({ dfiUtxoPercent, dfiTokenPercent }: { dfiUtxoPercent: BigNumber, dfiTokenPercent: BigNumber }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row')}>
      <ThemedView
        style={tailwind('flex flex-row py-1 px-2 rounded-xl mr-1')}
        light={tailwind('bg-gray-50')}
        dark={tailwind('bg-gray-900')}
      >
        <ThemedText
          style={tailwind('text-xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {'UTXO: '}
        </ThemedText>
        <NumberFormat
          value={dfiUtxoPercent.isNaN() ? 0 : dfiUtxoPercent.toFixed(2)}
          thousandSeparator
          decimalScale={2}
          displayType='text'
          suffix='%'
          renderText={value =>
            <BalanceText
              light={tailwind('text-black')}
              dark={tailwind('text-white')}
              style={tailwind('text-xs font-medium')}
              value={value}
              testID='dfi_utxo_percentage'
            />}
        />
      </ThemedView>
      <ThemedView
        style={tailwind('flex flex-row py-1 px-2 rounded-xl')}
        light={tailwind('bg-gray-50')}
        dark={tailwind('bg-gray-900')}
      >
        <ThemedText
          style={tailwind('text-xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {'Token: '}
        </ThemedText>
        <NumberFormat
          value={dfiTokenPercent.isNaN() ? 0 : dfiTokenPercent.toFixed(2)}
          thousandSeparator
          decimalScale={2}
          displayType='text'
          suffix='%'
          renderText={value =>
            <BalanceText
              light={tailwind('text-black')}
              dark={tailwind('text-white')}
              style={tailwind('text-xs font-medium')}
              value={value}
              testID='dfi_token_percentage'
            />}
        />
      </ThemedView>
    </View>
  )
}

function DFIBreakdownAction ({ onBreakdownPress, isBreakdownExpanded }: { onBreakdownPress: () => void, isBreakdownExpanded: boolean }): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  return (
    <View style={tailwind('flex-row justify-between flex-1 items-center')}>
      <TouchableOpacity>
        <ThemedIcon
          iconType='MaterialIcons'
          name='swap-vert'
          size={24}
          onPress={() => navigation.navigate({
            name: 'Convert',
            params: { mode: 'utxosToAccount' },
            merge: true
          })}
          testID='convert_dfi_button'
          style={tailwind('ml-1')}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onBreakdownPress}
        testID='details_dfi'
      >
        <ThemedIcon
          light={tailwind('text-gray-600')}
          dark={tailwind('text-gray-300')}
          iconType='MaterialIcons'
          name={!isBreakdownExpanded ? 'expand-more' : 'expand-less'}
          size={24}
        />
      </TouchableOpacity>
    </View>
  )
}
