// TODO: (thabrad) uncomment when applying proper BackgroundImage

// import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { PortfolioParamList } from '@screens/AppNavigator/screens/Portfolio/PortfolioNavigator'
import { DFITokenSelector, DFIUtxoSelector, unifiedDFISelector } from '@store/wallet'
import { tailwind } from '@tailwind'
import { /* ImageBackground, */ TouchableOpacity, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
// import DFIBackground from '@assets/images/DFI_balance_bg_gradient.png'
// import DFIBackgroundDark from '@assets/images/DFI_balance_bg_gradient_dark.png'
import { ThemedIcon, ThemedText, ThemedView, ThemedTouchableOpacity } from '@components/themed'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TokenNameText } from '@screens/AppNavigator/screens/Portfolio/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Portfolio/components/TokenAmountText'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'
import { TokenBreakdownDetails } from './TokenBreakdownDetails'
import NumberFormat from 'react-number-format'
import { BalanceText } from './BalanceText'
import { translate } from '@translations'
interface DFIBalaceCardProps {
  denominationCurrency: string
  staked: number
}

export function DFIBalanceCard ({ denominationCurrency, staked }: DFIBalaceCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { getTokenPrice } = useTokenPrice(denominationCurrency) // input based on selected denomination from portfolio tab
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const lockedToken = useTokenLockedBalance({ displaySymbol: 'DFI', denominationCurrency }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const usdAmount = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount), DFIUnified.isLPS)
  const availableValue = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount))
  const stakedAmount = new BigNumber(staked)
  const stakedValue = getTokenPrice(DFIUnified.symbol, new BigNumber(staked))
  const DFIIcon = getNativeIcon('_UTXO')
  // const { isLight } = useThemeContext()
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false)
  const onBreakdownPress = (): void => {
    setIsBreakdownExpanded(!isBreakdownExpanded)
  }

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-dfxblue-800')}
      style={tailwind('mx-4 mb-1.5 mt-2 rounded-lg flex-1')}
      testID='dfi_balance_card'
    >
      <View style={tailwind('flex-col flex-1')}>
        <>
          {/* <ImageBackground
          source={true ? '' : isLight ? DFIBackground : DFIBackgroundDark}
          style={tailwind('flex-1 rounded-lg overflow-hidden')}
          resizeMode='cover'
          resizeMethod='scale'
        > */}
          <ThemedTouchableOpacity
            onPress={() => navigation.navigate({
              name: 'TokenDetail',
              params: { token: DFIUnified },
              merge: true
            })}
            style={tailwind('flex-1')}
            dark={tailwind('border-0')}
            light={tailwind('border-0')}
            testID='dfi_balance_card_touchable'
          >
            <View style={tailwind('flex-row m-4 mb-2 flex-1 justify-between')}>
              <View style={tailwind('flex-row items-center')}>
                <DFIIcon width={32} height={32} />
                <TokenNameText displaySymbol='DFI' name='DeFiChain' testID='total_dfi_label' />
              </View>
              {
                hasFetchedToken
                  ? (
                    <TokenAmountText
                      tokenAmount={DFIUnified.amount}
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
          </ThemedTouchableOpacity>
          {hasFetchedToken && !new BigNumber(DFIUtxo.amount ?? 0).plus(DFIToken.amount ?? 0).gt(0)
            // eslint-disable-next-line no-constant-condition
            ? true ? (<></>) : (<GetDFIBtn />)
            : (
              <View style={tailwind('mx-4 mb-2 flex-row items-center')}>
                {/* {
                  hasFetchedToken
                    ? (
                      <View style={tailwind('flex-row items-center')}>
                        <View style={tailwind('mr-1')}>
                          <DFIBreakdownPercentageItem
                            label='UTXO: '
                            value={new BigNumber(DFIUtxo.amount).div(DFIUnified.amount).multipliedBy(100)}
                            type='utxo'
                          />
                        </View>
                        <DFIBreakdownPercentageItem
                          label='Token: '
                          value={new BigNumber(DFIToken.amount).div(DFIUnified.amount).multipliedBy(100)}
                          type='token'
                        />
                      </View>
                    )
                    : (
                      <>
                        <TextSkeletonLoader
                          iContentLoaderProps={{
                            width: '97',
                            height: '24',
                            testID: 'dfi_utxo_percentage_skeleton_loader'
                          }}
                          textXRadius='12'
                          textYRadius='12'
                        />
                        <TextSkeletonLoader
                          iContentLoaderProps={{
                            width: '101',
                            height: '24',
                            testID: 'dfi_token_percentage_skeleton_loader'
                          }}
                          textHorizontalOffset='4'
                          textWidth='97'
                          textXRadius='12'
                          textYRadius='12'
                        />
                      </>
                    )
                  } */}
                <DFIBreakdownAction onBreakdownPress={onBreakdownPress} isBreakdownExpanded={isBreakdownExpanded} />
              </View>
            )}
        </>
        {/* </ImageBackground> */}
      </View>

      {isBreakdownExpanded && (
        <ThemedView
          light={tailwind('border-t border-gray-100')}
          dark={tailwind('border-t border-dfxblue-900')}
          style={tailwind('mx-4 mb-4 pt-4')}
        >
          <TokenBreakdownDetails
            hasFetchedToken={hasFetchedToken}
            lockedAmount={lockedToken.amount}
            lockedValue={lockedToken.tokenValue}
            availableAmount={new BigNumber(DFIUnified.amount)}
            availableValue={availableValue}
            stakedAmount={new BigNumber(stakedAmount)}
            stakedValue={stakedValue}
            testID='dfi'
            dfiUtxo={DFIUtxo}
            dfiToken={DFIToken}
            denominationCurrency={denominationCurrency}
          />
        </ThemedView>
      )}
    </ThemedView>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DFIBreakdownPercentageItem ({ label, value, type }: { label: string, value: BigNumber, type: 'utxo' | 'token' }): JSX.Element {
  return (
    <ThemedView
      style={tailwind('flex flex-row py-1 px-2 rounded-xl')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-dfxblue-900')}
    >
      <ThemedText
        style={tailwind('text-xs')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-dfxgray-400')}
      >
        {translate('screens/PortfolioScreen', label)}
      </ThemedText>
      <NumberFormat
        value={value.isNaN() ? 0 : value.toFixed(2)}
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
            testID={`dfi_${type}_percentage`}
          />}
      />
    </ThemedView>
  )
}

function DFIBreakdownAction ({ onBreakdownPress, isBreakdownExpanded }: { onBreakdownPress: () => void, isBreakdownExpanded: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-center flex-1 items-center')}>
      {/* <TouchableOpacity>
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
          dark={tailwind('text-dfxred-500')}
        />
      </TouchableOpacity> */}
      <TouchableOpacity
        onPress={onBreakdownPress}
        testID='details_dfi'
      >
        <ThemedIcon
          light={tailwind('text-gray-600')}
          dark={tailwind('text-dfxgray-300')}
          iconType='MaterialIcons'
          name={!isBreakdownExpanded ? 'expand-more' : 'expand-less'}
          size={24}
        />
      </TouchableOpacity>
    </View>
  )
}

function GetDFIBtn (): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  return (
    <ThemedView
      light={tailwind('bg-primary-50')}
      dark={tailwind('bg-darkprimary-50')}
      style={tailwind('mt-1')}
    >
      <LinearGradient
        start={[0, 0]}
        end={[1, 1]}
        colors={['#1A0C75', '#1C0C75', '#1F0D75', '#240E75', '#2A0F75', '#321175', '#3C1375', '#461575', '#511876', '#5C1B76', '#681D76', '#732076', '#7F2276', '#8A2576', '#952776', '#9E2A77']}
        locations={[0, 0.1124, 0.2038, 0.2776, 0.3368, 0.3848, 0.4247, 0.4598, 0.4933, 0.5284, 0.5683, 0.6163, 0.6756, 0.7493, 0.8408, 0.9531]}
      >
        <TouchableOpacity
          style={tailwind('flex-row items-center')}
          testID='get_DFI_btn'
          onPress={() => navigation.navigate('GetDFIScreen')}
        >
          <View style={tailwind('mx-4 my-2 flex-row justify-between flex-1 items-center')}>
            <View style={tailwind('flex-row flex-1 items-center')}>
              <Text
                style={tailwind('font-medium text-sm text-gray-50')}
              >
                {translate('screens/GetDFIScreen', 'Get $DFI')}
              </Text>
            </View>

            <ThemedIcon
              iconType='MaterialCommunityIcons'
              name='arrow-right'
              size={18}
              testID='get_dfi'
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-50')}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </ThemedView>
  )
}
