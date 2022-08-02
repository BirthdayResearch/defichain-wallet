import { tailwind } from '@tailwind'
import { View, StyleProp, TextStyle, TextProps } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedTextV2, ThemedIcon, ThemedProps } from '@components/themed'
import { BottomSheetModal } from '@components/BottomSheetModal'
import { WalletToken } from '@store/wallet'
import NumberFormat from 'react-number-format'
import { translate } from '@translations'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { useDenominationCurrency } from '@screens/AppNavigator/screens/Portfolio/hooks/PortfolioCurrency'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Portfolio/components/TotalPortfolio'
import BigNumber from 'bignumber.js'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'

interface TokenIconPoolPairProps {
    pairData: PoolPairData
    poolInfo: WalletToken
    totalPooledTokenA: string
    totalPooledTokenB: string
}

export function TokenIconPoolPair ({
    pairData,
    poolInfo,
    totalPooledTokenA,
    totalPooledTokenB
}: TokenIconPoolPairProps): JSX.Element {
  const TokenIconA = getNativeIcon(pairData.tokenA.displaySymbol)
  const TokenIconB = getNativeIcon(pairData.tokenB.displaySymbol)

  return (
    <View style={tailwind('w-full items-center my-8')}>
      <View>
        <TokenIconA style={tailwind('absolute z-50')} width={56} height={56} />
        <TokenIconB style={tailwind('ml-9 z-40')} width={56} height={56} />
      </View>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('mt-2 text-lg font-semibold-v2')}
      >
        {`${pairData.tokenA.displaySymbol}-${pairData.tokenB.displaySymbol}`}
      </ThemedTextV2>
      <PoolInfoModal
        pairData={pairData}
        poolInfo={poolInfo}
        totalPooledTokenA={totalPooledTokenA}
        totalPooledTokenB={totalPooledTokenB}
      />
    </View>
  )
}

interface PoolInfoModalProps {
    pairData: PoolPairData
    poolInfo: WalletToken
    totalPooledTokenA: string
    totalPooledTokenB: string
    infoIconStyle?: StyleProp<TextStyle>
}

function PoolInfoModal ({
    pairData,
    infoIconStyle,
    poolInfo,
    totalPooledTokenA,
    totalPooledTokenB
  }: PoolInfoModalProps): JSX.Element {
    const TokenIconA = getNativeIcon(pairData.tokenA.displaySymbol)
    const TokenIconB = getNativeIcon(pairData.tokenB.displaySymbol)
    const { getTokenPrice } = useTokenPrice()
    const { denominationCurrency } = useDenominationCurrency()

    const getUSDValue = (
      amount: BigNumber,
      symbol: string,
      isLPs: boolean = false
    ): BigNumber => {
      return getTokenPrice(symbol, amount, isLPs)
    }

    return (
      <BottomSheetModal
        name={`${pairData.tokenA.displaySymbol}_${pairData.tokenB.displaySymbol}_modal_info`}
        index={0}
        snapPoints={['50%']}
        triggerComponent={
          <ThemedIcon
            size={16}
            name='info-outline'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
            style={infoIconStyle}
          />
        }
        enableScroll
      >
        <View style={tailwind('pt-0 pb-16')}>
          <View
            style={tailwind('flex-row mb-3')}
          >
            <View>
              <TokenIconA style={tailwind('absolute z-50')} width={32} height={32} />
              <TokenIconB style={tailwind('ml-5 z-40')} width={32} height={32} />
            </View>
            <ThemedTextV2
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('pl-1 text-2xl font-semibold')}
            >
              {`${pairData.tokenA.displaySymbol}-${pairData.tokenB.displaySymbol}`}
            </ThemedTextV2>
          </View>

          <View style={tailwind('mt-5')}>
            <View style={tailwind('mb-3')}>
              <AmountDetailsRow
                label={translate('screens/RemoveLiquidity', 'Pool share')}
                amount={poolInfo.amount}
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-900'),
                  light: tailwind('text-mono-light-v2-900')
                }}
                suffix={` ${poolInfo.displaySymbol}`}
                testID='Pool_share_amount'
              />
              <AmountDetailsRow
                amount='3.123'
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-700'),
                  light: tailwind('text-mono-light-v2-700')
                }}
                prefix='('
                suffix='%)'
                testID='Pool_share_amount'
              />
            </View>
            <View style={tailwind('mb-3')}>
              <AmountDetailsRow
                label={translate('screens/RemoveLiquidity', `Pooled ${pairData.tokenA.displaySymbol}`)}
                amount={totalPooledTokenA}
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-900'),
                  light: tailwind('text-mono-light-v2-900')
                }}
                testID='Pool_share_amount'
              />
              <AmountDetailsRow
                amount={getUSDValue(new BigNumber(totalPooledTokenA), pairData.tokenA.symbol).toFixed(2)}
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-700'),
                  light: tailwind('text-mono-light-v2-700')
                }}
                prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
                suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
                testID='Pool_share_amount'
              />
            </View>
            <View style={tailwind('mb-3')}>
              <AmountDetailsRow
                label={translate('screens/RemoveLiquidity', `Pooled ${pairData.tokenB.displaySymbol}`)}
                amount={totalPooledTokenB}
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-900'),
                  light: tailwind('text-mono-light-v2-900')
                }}
                testID='Pool_share_amount'
              />
              <AmountDetailsRow
                amount={getUSDValue(new BigNumber(totalPooledTokenB), pairData.tokenB.symbol).toFixed(2)}
                valueThemeProps={{
                  dark: tailwind('text-mono-dark-v2-700'),
                  light: tailwind('text-mono-light-v2-700')
                }}
                prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
                suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
                testID='Pool_share_amount'
              />
            </View>
            {pairData?.apr?.total !== undefined && pairData?.apr?.total !== null && (
              <AmountDetailsRow
                label='APR'
                amount={new BigNumber(isNaN(pairData.apr.total) ? 0 : pairData.apr.total).times(100).toFixed(2)}
                valueThemeProps={{
                  dark: tailwind('text-darksuccess-500'),
                  light: tailwind('text-success-500')
                }}
                valueTextStyle={tailwind('font-semibold-v2')}
                suffix='%'
                testID='Pool_share_amount'
              />
            )}
          </View>
        </View>
      </BottomSheetModal>
    )
  }

interface AmountDetailsProps {
  label?: string
  labelTextStyle?: StyleProp<TextProps>
  labelThemeProps?: ThemedProps
  valueTextStyle?: StyleProp<TextProps>
  valueThemeProps?: ThemedProps
  amount: string
  testID: string
  prefix?: string
  suffix?: string
}

function AmountDetailsRow ({
  label = '',
  labelTextStyle,
  labelThemeProps = {
    dark: tailwind('text-mono-dark-v2-700'),
    light: tailwind('text-mono-light-v2-700')
  },
  valueTextStyle,
  valueThemeProps = {
    dark: tailwind('text-mono-dark-v2-900'),
    light: tailwind('text-mono-light-v2-900')
  },
  amount,
  testID,
  prefix,
  suffix
}: AmountDetailsProps): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between items-start')}>
      {label.length > 0 && (
        <ThemedTextV2
          light={labelThemeProps.light}
          dark={labelThemeProps.dark}
          style={[tailwind('text-sm font-normal-v2'), labelTextStyle]}
        >
          {label}
        </ThemedTextV2>
      )}
      <View style={tailwind('flex-row flex-1 justify-end')}>
        <NumberFormat
          value={amount}
          thousandSeparator
          displayType='text'
          prefix={prefix}
          suffix={suffix}
          renderText={value =>
            <ThemedTextV2
              light={valueThemeProps.light}
              dark={valueThemeProps.dark}
              style={[tailwind('text-sm font-normal-v2'), valueTextStyle]}
              testID={`${testID}_amount`}
            >
              {value}
            </ThemedTextV2>}
        />
      </View>
    </View>
  )
}
