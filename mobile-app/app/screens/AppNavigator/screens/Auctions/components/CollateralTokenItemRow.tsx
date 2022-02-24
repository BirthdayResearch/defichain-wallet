import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

export function CollateralTokenItemRow ({ token }: { token: LoanVaultTokenAmount }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `collateral_row_${token.id}`
  const activePrice = new BigNumber(getActivePrice(token.symbol, token.activePrice))
  const collateralPrice = new BigNumber(activePrice).multipliedBy(token.amount)

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-100')}
      style={tailwind('p-4 flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center w-6/12')}>
        <Icon testID={`${testID}_icon`} />
        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            testID={`${testID}_symbol`}
          >
            {token.displaySymbol}
          </ThemedText>
          <ThemedText
            ellipsizeMode='tail'
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            numberOfLines={1}
            style={tailwind('text-xs')}
            testID={`${testID}_name`}
          >
            {token.name}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('flex justify-end flex-1 items-end')}>
        <NumberFormat
          decimalScale={8}
          suffix={` ${token.displaySymbol}`}
          displayType='text'
          renderText={(value) =>
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('flex-wrap text-right')}
              testID={`${testID}_amount`}
            >
              {value}
            </ThemedText>}
          thousandSeparator
          value={new BigNumber(token.amount).toFixed(8)}
        />
        <NumberFormat
          decimalScale={8}
          prefix='≈ $'
          displayType='text'
          renderText={(value) =>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs flex-wrap text-right')}
              testID={`${testID}_amount`}
            >
              {value}
            </ThemedText>}
          thousandSeparator
          value={getUSDPrecisedPrice(collateralPrice)}
        />
      </View>
    </ThemedView>
  )
}
