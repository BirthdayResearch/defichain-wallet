import { useEffect, useState } from 'react'
import * as React from 'react'
import { Linking, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import { tokensSelector, WalletToken, unifiedDFISelector } from '@store/wallet'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import {
  CustomIcon,
  IconName,
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { ConversionMode } from './ConvertScreen'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

interface TokenActionItems {
  title: string
  icon: IconName | typeof CustomIcon
  onPress: () => void
  testID: string
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
  const DFIUnified = useSelector((state: RootState) => unifiedDFISelector(state.wallet))
  const {
    pair,
    token,
    swapTokenDisplaySymbol
  } = usePoolPairToken(route.params.token)
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
    <ThemedScrollView>
      <TokenSummary token={token} />
      <ThemedSectionTitle
        testID='title_available_options'
        text={translate('screens/TokenDetailScreen', 'AVAILABLE OPTIONS')}
      />

      {
        token.id !== '0' && (
          <>
            <TokenActionRow
              icon='money' // {BtnSell} // TODO: add + implement custom icon
              onPress={() => navigation.navigate({
                name: 'Sell',
                params: { token },
                merge: true
              })}
              testID='sell_button'
              title={translate('screens/TokenDetailScreen', 'Sell')}
            />

            <TokenActionRow
              icon='arrow-upward'
              onPress={() => navigation.navigate({
                name: 'Send',
                params: { token },
                merge: true
              })}
              testID='send_button'
              title={translate('screens/TokenDetailScreen', 'Send to other wallet')}
            />

            <TokenActionRow
              icon='arrow-downward'
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
            icon='swap-vert'
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
        token.symbol === 'DFI' && (
          <TokenActionRow
            icon='swap-horiz'
            onPress={() => onNavigateSwap({ fromToken: { ...DFIUnified, id: '0' } })}
            testID='swap_button_dfi'
            title={translate('screens/TokenDetailScreen', 'Swap token')}
          />
        )
      }

      {
        (!token.isLPS && pair !== undefined && swapTokenDisplaySymbol !== undefined) && (
          <TokenActionRow
            icon='swap-horiz'
            onPress={() => onNavigateSwap({ pair })}
            testID='swap_button'
            title={translate('screens/TokenDetailScreen', 'Swap token')}
          />)
      }

      {
        pair !== undefined && (
          <TokenActionRow
            icon='add'
            onPress={() => onNavigateLiquidity({
              destination: 'AddLiquidity',
              pair
            })}
            testID='add_liquidity_button'
            title={translate('screens/TokenDetailScreen', 'Add to liquidity pool')}
          />)
      }

      {
        token.isLPS && pair !== undefined && (
          <TokenActionRow
            icon='remove'
            onPress={() => onNavigateLiquidity({
              destination: 'RemoveLiquidity',
              pair
            })}
            testID='remove_liquidity_button'
            title={translate('screens/TokenDetailScreen', 'Remove liquidity')}
          />)
      }
    </ThemedScrollView>
  )
}

function TokenSummary (props: { token: WalletToken }): JSX.Element {
  const Icon = getNativeIcon(props.token.displaySymbol)
  const { getTokenUrl } = useDeFiScanContext()

  const onTokenUrlPressed = async (): Promise<void> => {
    const id = (props.token.id === '0_utxo' || props.token.id === '0_unified') ? 0 : props.token.id
    const url = getTokenUrl(id)
    await Linking.openURL(url)
  }

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-dfxblue-800')}
      style={tailwind('px-4 pt-6')}
    >
      <View style={tailwind('flex-row items-center mb-1')}>
        <Icon height={24} width={24} style={tailwind('mr-2')} />
        <TouchableOpacity
          onPress={onTokenUrlPressed}
          testID='token_detail_explorer_url'
        >
          <View style={tailwind('flex-row items-center')}>
            <ThemedText
              dark={tailwind('text-dfxred-500')}
              light={tailwind('text-primary-500')}
            >
              {props.token.name}
            </ThemedText>
            <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
              <ThemedIcon
                dark={tailwind('text-dfxred-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={tailwind('flex-row items-center mb-4')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              style={tailwind('text-2xl font-bold flex-wrap mr-1')}
              testID='token_detail_amount'
            >
              {value}
            </ThemedText>
          )}
          thousandSeparator
          value={new BigNumber(props.token.amount).toFixed(8)}
        />
        <ThemedText
          light={tailwind('text-dfxgray-500')}
          dark={tailwind('text-dfxgray-400')}
          style={tailwind('text-sm')}
        >
          {props.token.displaySymbol}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function TokenActionRow ({
  title,
  icon,
  onPress,
  testID
}: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row py-4 pl-4 pr-2 bg-white border-b items-center border-gray-200')}
      testID={testID}
    >
      <ThemedIcon
        dark={tailwind('text-dfxred-500')}
        iconType={(icon === CustomIcon) ? 'DfxIcon' : 'MaterialIcons'}
        light={tailwind('text-primary-500')}
        name={icon}
        size={24}
      />

      <ThemedText style={tailwind('flex-grow ml-2')}>
        {title}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
