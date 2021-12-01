import React from 'react'
import { ThemedIcon, ThemedSectionTitle, ThemedText, ThemedView, ThemedTouchableOpacity } from '@components/themed'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { NumberRow } from '@components/NumberRow'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { TextRow } from '@components/TextRow'
import { useAuctionTime } from '../hooks/AuctionTimeLeft'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

export function AuctionDetails (props: { vault: LoanVaultLiquidated, batch: LoanVaultLiquidationBatch }): JSX.Element {
  const { vault, batch } = props
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { getVaultsUrl, getAddressUrl } = useDeFiScanContext()
  const { timeSpent } = useAuctionTime(vault.liquidationHeight, blockCount ?? 0)

  const collateralValue = batch.collaterals.reduce((total, eachItem) => {
    return total.plus(new BigNumber(eachItem.amount).multipliedBy(eachItem.activePrice?.active?.amount ?? 0))
  }, new BigNumber(0))

  return (
    <>
      <ThemedSectionTitle
        testID='vault_details'
        text={translate('screens/BatchDetailsScreen', 'VAULT DETAILS')}
      />

      <RowLinkItem
        label={translate('components/BatchDetailsScreen', 'Vault ID')}
        value={vault.vaultId}
        onPress={async () => await openURL(getVaultsUrl(vault.vaultId))}
      />

      <RowLinkItem
        label={translate('components/BatchDetailsScreen', 'Owner ID')}
        value={vault.ownerAddress}
        onPress={async () => await openURL(getAddressUrl(vault.ownerAddress))}
      />

      <NumberRow
        lhs={translate('components/BatchDetailsScreen', 'Liquidation height')}
        rhs={{
          value: vault.liquidationHeight,
          testID: 'text_liquidation_height'
        }}
      />

      <ThemedSectionTitle
        testID='vault_details'
        text={translate('screens/BatchDetailsScreen', 'ADDITIONAL DETAILS')}
      />

      <NumberRow
        lhs={translate('components/BatchDetailsScreen', 'Collateral Value (USD)')}
        rhs={{
          value: new BigNumber(collateralValue).toFixed(2),
          testID: 'text_collateral_value',
          prefix: '$'
        }}
      />

      {/* TODO calculate Min. starting bid */}
      {/* <NumberRow
        lhs={translate('components/BatchDetailsScreen', 'Min. starting bid')}
        rhs={{
          value: '',
          testID: 'text_min_starting_bid'
        }}
      /> */}

      <TextRow
        lhs={translate('components/BatchDetailsScreen', 'Auction start')}
        rhs={{
          value: `~ ${timeSpent}`,
          testID: 'auction_start'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
    </>
  )
}

function RowLinkItem (props: {label: string, value: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-center w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText style={tailwind('text-sm font-normal')}>
            {props.label}
          </ThemedText>
        </View>
      </View>

      <View style={tailwind('flex-1')}>
        <View style={tailwind('flex flex-row items-center ')}>
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('text-right w-11/12 text-sm font-normal')}
            numberOfLines={1}
            ellipsizeMode='middle'
          >
            {props.value}
          </ThemedText>
          <ThemedTouchableOpacity
            onPress={props.onPress}
            testID='ocean_vault_explorer'
          >
            <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='open-in-new'
              style={tailwind('text-right ml-1')}
              size={16}
            />
          </ThemedTouchableOpacity>
        </View>
      </View>
    </ThemedView>
  )
}
