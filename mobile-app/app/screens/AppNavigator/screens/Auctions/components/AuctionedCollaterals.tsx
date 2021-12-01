import React from 'react'
import { ThemedSectionTitle, ThemedText } from '@components/themed'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import NumberFormat from 'react-number-format'
import { CollateralTokenItemRow } from './CollateralTokenItemRow'

export function AuctionedCollaterals (props: { collaterals: LoanVaultTokenAmount[], auctionAmount: string }): JSX.Element {
  const { collaterals, auctionAmount } = props
  return (
    <>
      <ThemedSectionTitle
        testID='collateral_token_count'
        text={translate('components/AuctionedCollaterals', '{{count}} COLLATERAL TOKENS', { count: collaterals.length })}
      />
      {collaterals.map((token: LoanVaultTokenAmount, index: any) =>
        <CollateralTokenItemRow
          key={token.id}
          token={token}
        />
        )}
      <View style={tailwind('p-4 flex flex-row justify-end')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {translate('components/AuctionedCollaterals', 'Total auction value (USD):')}
        </ThemedText>
        <NumberFormat
          decimalScale={8}
          prefix=' $'
          displayType='text'
          renderText={(value) =>
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('font-medium')}
              testID='total_auction_value'
            >
              {value}
            </ThemedText>}
          thousandSeparator
          value={auctionAmount}
        />
      </View>
    </>
  )
}
