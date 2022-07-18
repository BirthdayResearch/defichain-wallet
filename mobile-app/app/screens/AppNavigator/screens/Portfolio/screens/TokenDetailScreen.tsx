import { useEffect, useState } from 'react'
import * as React from 'react'
import { Linking, Platform, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import { tokensSelector, WalletToken, unifiedDFISelector, DFITokenSelector, DFIUtxoSelector } from '@store/wallet'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import {
  IconName,
  IconType,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { ConversionMode } from './ConvertScreen'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { ButtonV2 } from '@components/ButtonV2'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'
import { useTokenPrice } from '../hooks/TokenPrice'
import { useDenominationCurrency } from '../hooks/PortfolioCurrency'
import { InfoTextLinkV2 } from '@components/InfoTextLink'
import { TokenBreakdownDetailsV2 } from '../components/TokenBreakdownDetailsV2'
import { getPrecisedTokenValue } from '../../Auctions/helpers/precision-token-value'
import { PortfolioButtonGroupTabKey } from '../components/TotalPortfolio'
import { openURL } from '@api/linking'
import { PoolPairTextSectionV2 } from '../../Dex/components/PoolPairCards/PoolPairTextSection'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'

interface TokenActionItems {
  title: string
  icon: IconName
  onPress: () => void
  testID: string
  iconType: IconType
  border?: boolean
}

type Props = StackScreenProps<PortfolioParamList, 'TokenDetailScreen'>

const usePoolPairToken = (tokenParam: WalletToken): { pair?: PoolPairData, token: WalletToken, swapTokenDisplaySymbol?: string } => {
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

  // state
  const [token, setToken] = useState(tokenParam)
  const [pair, setPair] = useState<PoolPairData>()
  const [swapTokenDisplaySymbol, setSwapTokenDisplaySymbol] = useState<string>()

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)

    if (t !== undefined) {
      setToken(t)
    }

    const poolpair = pairs.find((p) => {
      if (token.isLPS) {
        return p.data.id === token.id
      }
      // get pair with same id if token passed is not LP
      if (token.id === p.data.tokenA.id) {
        setSwapTokenDisplaySymbol(p.data.tokenB.displaySymbol)
        return true
      }
      if (token.id === p.data.tokenB.id) {
        setSwapTokenDisplaySymbol(p.data.tokenA.displaySymbol)
        return true
      }
      return false
    })?.data

    if (poolpair !== undefined) {
      setPair(poolpair)
    }
  }, [token, JSON.stringify(tokens), pairs])

  return {
    pair,
    token,
    swapTokenDisplaySymbol
  }
}

export function TokenDetailScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const { denominationCurrency } = useDenominationCurrency()
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { getTokenPrice } = useTokenPrice(denominationCurrency) // input based on selected denomination from portfolio tab
  const lockedToken = useTokenLockedBalance({ displaySymbol: 'DFI', denominationCurrency: denominationCurrency }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const availableValue = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const {
    pair,
    token,
    swapTokenDisplaySymbol
  } = usePoolPairToken(route.params.token)

  // usdAmount for crypto tokens, undefined for DFI token
  const usdAmount = route.params.token.usdAmount

  const onNavigateLiquidity = ({
    destination,
    pair
  }: { destination: 'AddLiquidity' | 'RemoveLiquidity', pair: PoolPairData }): void => {
    navigation.navigate(translate('BottomTabNavigator', 'Portfolio'), {
      screen: destination,
      initial: false,
      params: {
        pair
      },
      merge: true
    })
  }

  const onNavigateSwap = ({
    pair,
    fromToken
  }: { pair?: PoolPairData, fromToken?: WalletToken }): void => {
    navigation.navigate(translate('BottomTabNavigator', 'Portfolio'), {
      screen: 'CompositeSwap',
      initial: false,
      params: {
        pair,
        fromToken,
        tokenSelectOption: {
          from: {
            isDisabled: true,
            isPreselected: true
          },
          to: {
            isDisabled: false,
            isPreselected: false
          }
        }
      },
      merge: true
    })
  }

  return (
    <ThemedScrollViewV2>
      <TokenSummary
        token={token}
        border
        usdAmount={usdAmount ?? new BigNumber(0)}
        denominationCurrency={denominationCurrency}
      />
      <View style={tailwind('p-5')}>

        <TokenBreakdownDetailsV2
          hasFetchedToken={hasFetchedToken}
          lockedAmount={lockedToken.amount}
          lockedValue={lockedToken.tokenValue}
          availableAmount={new BigNumber(DFIUnified.amount)}
          availableValue={availableValue}
          testID='dfi'
          dfiUtxo={DFIUtxo}
          dfiToken={DFIToken}
          denominationCurrency={denominationCurrency}
          token={token}
          usdAmount={usdAmount ?? new BigNumber(0)}
          pair={pair}
        />

        {
          token.symbol === 'DFI' && (
            <ThemedViewV2
              dark={tailwind('border-mono-dark-v2-300')}
              light={tailwind('border-mono-light-v2-300')}
            >
              <InfoTextLinkV2
                onPress={async () => await openURL('https://defichain.com/dfi')}
                text='Learn more about DFI'
                testId='dfi_learn_more'
              />
            </ThemedViewV2>
          )
        }
      </View>

      <View style={tailwind('px-5')}>
        <ThemedViewV2
          dark={tailwind('bg-mono-dark-v2-00')}
          light={tailwind('bg-mono-light-v2-00')}
          style={tailwind('rounded-lg-v2')}
        >
          {
            token.id !== '0' && (
              <>
                <TokenActionRow
                  icon='arrow-up-right'
                  iconType='Feather'
                  border
                  onPress={() => navigation.navigate({
                    name: 'Send',
                    params: { token },
                    merge: true
                  })}
                  testID='send_button'
                  title={translate('screens/TokenDetailScreen', 'Send to other wallet')}
                />

                <TokenActionRow
                  icon='arrow-down-left'
                  iconType='Feather'
                  border
                  onPress={() => navigation.navigate('Receive')}
                  testID='receive_button'
                  title={`${translate('screens/TokenDetailScreen', 'Receive {{token}}', { token: token.displaySymbol })}`}
                />
              </>
            )
          }

          {
            token.symbol === 'DFI' && (
              <TokenActionRow
                icon='swap-calls'
                iconType='MaterialIcons'
                onPress={() => {
                  const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
                  navigation.navigate({
                    name: 'Convert',
                    params: { mode },
                    merge: true
                  })
                }}
                testID='convert_button'
                title={`${translate('screens/TokenDetailScreen', 'Convert to {{symbol}}', { symbol: `${token.id === '0_utxo' ? 'Token' : 'UTXO'}` })}`}
              />
            )
          }
          {
            token.isLPS && pair !== undefined && (
              <TokenActionRow
                icon='minus-circle'
                iconType='Feather'
                onPress={() => onNavigateLiquidity({
                  destination: 'RemoveLiquidity',
                  pair
                })}
                testID='remove_liquidity_button'
                title={translate('screens/TokenDetailScreen', 'Remove liquidity')}
              />)
          }
          {
            pair !== undefined && !token.isLPS && (
              <TokenActionRow
                icon='plus-circle'
                iconType='Feather'
                onPress={() => onNavigateLiquidity({
                  destination: 'AddLiquidity',
                  pair
                })}
                testID='add_liquidity_button'
                title={translate('screens/TokenDetailScreen', 'Add liquidity')}
              />)
          }
        </ThemedViewV2>

        {/*  Show only for LP tokens */}
        <View style={tailwind('px-5')}>
          {
            pair !== undefined && token.isLPS && (
              <ButtonV2
                onPress={() => onNavigateLiquidity({
                  destination: 'AddLiquidity',
                  pair
                })}
                testID='add_liquidity_button'
                label={translate('screens/TokenDetailScreen', 'Add liquidity')}
              />)
          }

          {
            token.symbol === 'DFI' && (
              <ButtonV2
                onPress={() => onNavigateSwap({ fromToken: { ...DFIUnified, id: '0' } })}
                testID='swap_button_dfi'
                label={translate('screens/TokenDetailScreen', 'Swap')}
              />
            )
          }

          {
            (!token.isLPS && pair !== undefined && swapTokenDisplaySymbol !== undefined) && (
              <ButtonV2
                onPress={() => onNavigateSwap({ pair })}
                testID='swap_button'
                label={translate('screens/TokenDetailScreen', 'Swap')}
              />)
          }
        </View>
      </View>
    </ThemedScrollViewV2>
  )
}

function TokenSummary (props: { token: WalletToken, border?: boolean, usdAmount: BigNumber, denominationCurrency: string }): JSX.Element {
  const Icon = getNativeIcon(props.token.displaySymbol)
  const { getTokenUrl } = useDeFiScanContext()
  const onTokenUrlPressed = async (): Promise<void> => {
    const id = (props.token.id === '0_utxo' || props.token.id === '0_unified') ? 0 : props.token.id
    const url = getTokenUrl(id)
    await Linking.openURL(url)
  }

  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const { getTokenPrice } = useTokenPrice(props.denominationCurrency) // input based on selected denomination from portfolio tab
  const dfiUsdAmount = getTokenPrice(DFIUnified.symbol, new BigNumber(DFIUnified.amount), DFIUnified.isLPS)
  const displayCurrency = props.denominationCurrency === PortfolioButtonGroupTabKey.USDT ? 'USD' : ` ${props.denominationCurrency}`
  const isTokenPair = props.token.displaySymbol.includes('-')

  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet)
  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (props.token as AddressToken).symbol
  )
  const mappedPair = poolPairData?.data
  const [symbolA, symbolB] =
    mappedPair?.tokenA != null && mappedPair?.tokenB != null
      ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
      : props.token.symbol.split('-')

  return (
    <ThemedViewV2
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
      style={tailwind('py-4.5 ml-5 mr-4', { 'border-b-0.5': props.border, 'py-2': Platform.OS === 'android' })}
    >
      <View style={tailwind('flex-row items-center')}>
        <View>
          {
            isTokenPair
              ? (
                <PoolPairTextSectionV2
                  symbolA={symbolA}
                  symbolB={symbolB}
                />
              )
              : (
                <Icon height={40} width={40} />
              )
          }

        </View>
        <View style={tailwind('flex-col ml-2')}>
          <ThemedTextV2
            style={tailwind('text-sm font-bold-v2')}
          >
            {props.token.displaySymbol}
          </ThemedTextV2>
          <TouchableOpacity
            onPress={onTokenUrlPressed}
            testID='token_detail_explorer_url'
          >
            <View style={tailwind('flex-row')}>
              <ThemedTextV2>
                {props.token.name}
              </ThemedTextV2>
              <View style={tailwind('ml-1 flex-grow-0 justify-center')}>
                <ThemedIcon
                  iconType='MaterialIcons'
                  name='open-in-new'
                  size={16}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        {
          isTokenPair
            ? (
              <></>
            )
            : (
              <View style={[tailwind('flex-col'), { marginLeft: 'auto' }]}>
                <NumberFormat
                  decimalScale={8}
                  displayType='text'
                  renderText={(value) => (
                    <ThemedTextV2
                      style={tailwind('flex-wrap mr-1 text-sm font-semibold-v2 text-right')}
                      testID='token_detail_amount'
                    >
                      {value}
                    </ThemedTextV2>
                  )}
                  thousandSeparator
                  value={new BigNumber(props.token.amount).toFixed(8)}
                />
                <NumberFormat
                  decimalScale={8}
                  displayType='text'
                  suffix={` ${displayCurrency}`}
                  renderText={(value) => (
                    <ThemedTextV2
                      style={tailwind('flex-wrap mr-1 text-sm font-normal-v2 text-right')}
                      testID='token_detail_amount'
                    >
                      {value}
                    </ThemedTextV2>
                  )}
                  thousandSeparator
                  value={props.token.symbol === 'DFI' ? getPrecisedTokenValue(dfiUsdAmount) : getPrecisedTokenValue(props.usdAmount)}
                />
              </View>
            )
        }
      </View>
    </ThemedViewV2>
  )
}

function TokenActionRow ({
  title,
  icon,
  onPress,
  testID,
  iconType,
  border
}: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      onPress={onPress}
      style={tailwind('flex py-4.5 ml-5 mr-4 flex-row items-center justify-between', { 'border-b-0.5': border })}
      testID={testID}
    >
      <ThemedTextV2
        style={tailwind('flex-grow text-sm font-normal-v2 ml-2')}
      >
        {title}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-700')}
        iconType={iconType}
        name={icon}
        size={20}
      />
    </ThemedTouchableOpacityV2>
  )
}
