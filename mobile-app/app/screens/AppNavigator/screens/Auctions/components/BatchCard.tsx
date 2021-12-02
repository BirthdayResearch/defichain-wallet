import React from 'react'
import { TouchableOpacity } from 'react-native'
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { IconButton } from '@components/IconButton'
import { LoanVaultLiquidationBatch, LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { getNativeIcon } from '@components/icons/assets'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { AuctionTimeProgress } from './AuctionTimeProgress'
import { AuctionsParamList } from '../AuctionNavigator'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { CollateralTokenIconGroup } from './CollateralTokenIconGroup'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import { useAuctionBidValue } from '../hooks/AuctionBidValue'
import { getActivePrice } from '../helpers/ActivePrice'

export interface BatchCardProps {
  vault: LoanVaultLiquidated
  batch: LoanVaultLiquidationBatch
  testID?: string
  onQuickBid: (
    batch: LoanVaultLiquidationBatch,
    vaultId: string,
    minNextBidInToken: string) => void
}

export function BatchCard (props: BatchCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const { getVaultsUrl } = useDeFiScanContext()
  const { batch, testID, vault } = props
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const { minNextBidInToken } = useAuctionBidValue(batch, vault.liquidationPenalty, vault.loanScheme.interestRate)

  const nextBidInfo = {
    title: 'Min. next bid',
    message: 'The minimum bid a user must place, as long as it’s not the first bid for the batch'
  }

  const onCardPress = (): void => {
    navigation.navigate('AuctionDetailScreen', {
      batch,
      vault
    })
  }

  const onPlaceBid = (): void => {
    navigation.navigate('PlaceBidScreen', {
      batch,
      vault
    })
  }

  const onQuickBid = (): void => {
    props.onQuickBid(batch, vault.vaultId, minNextBidInToken)
  }

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <TouchableOpacity
        testID={testID}
        onPress={onCardPress}
      >
        <View style={tailwind('flex-row w-full items-center justify-between')}>
          <View style={tailwind('flex flex-row items-center')}>
            <ThemedView
              light={tailwind('bg-gray-100')}
              dark={tailwind('bg-gray-700')}
              style={tailwind('w-4 h-4 rounded-full items-center justify-center')}
            >
              <LoanIcon height={17} width={17} />
            </ThemedView>
            <View style={tailwind('flex flex-row items-center justify-center ml-2')}>
              <ThemedText style={tailwind('font-semibold flex-shrink')}>
                {batch.loan.displaySymbol}
              </ThemedText>
              <TouchableOpacity
                onPress={async () => await openURL(getVaultsUrl(vault.vaultId))}
                testID='ocean_vault_explorer'
              >
                <ThemedIcon
                  style={tailwind('ml-2')}
                  dark={tailwind('text-darkprimary-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  name='open-in-new'
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={tailwind('flex flex-row items-center justify-center')}>
            <CollateralTokenIconGroup
              symbols={batch.collaterals.map(collateral => collateral.displaySymbol)}
              maxIconToDisplay={3}
            />
            <ThemedIcon
              size={24}
              name='chevron-right'
              iconType='MaterialIcons'
              style={tailwind('ml-1')}
              dark={tailwind('text-gray-200')}
              light={tailwind('text-gray-700')}
            />
          </View>
        </View>
        {/* TODO add bid status logic */}
        {/* <AuctionBidStatus type='heights' /> */}
        <View style={tailwind('flex-row w-full items-center justify-between mb-2 mt-4')}>
          <View style={tailwind('flex flex-row')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs')}
            >
              {translate('components/BatchCard', 'Total auction value (USD)')}
            </ThemedText>
          </View>
          <View style={tailwind('flex flex-row')}>
            <NumberFormat
              displayType='text'
              prefix='$'
              decimalScale={2}
              renderText={(value: string) => (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('text-sm')}
                >
                  {value}
                </ThemedText>
              )}
              thousandSeparator
              value={new BigNumber(batch.loan.amount).multipliedBy(getActivePrice(batch.loan)).toFixed(2)}
            />
          </View>
        </View>

        <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
          <View style={tailwind('flex-row items-center justify-start')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs')}
            >
              {translate('components/BatchCard', 'Min. next bid')}
            </ThemedText>
            <View style={tailwind('ml-1')}>
              <BottomSheetInfo alertInfo={nextBidInfo} name={nextBidInfo.title} infoIconStyle={tailwind('text-xs')} />
            </View>
          </View>
          <View style={tailwind('flex flex-row')}>
            <NumberFormat
              displayType='text'
              suffix={` ${batch.loan.displaySymbol}`}
              renderText={(value: string) => (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('text-sm')}
                >
                  {value}
                </ThemedText>
              )}
              thousandSeparator
              value={minNextBidInToken}
            />
          </View>
        </View>
      </TouchableOpacity>

      <AuctionTimeProgress
        liquidationHeight={vault.liquidationHeight}
        blockCount={blockCount}
        label='Auction time left'
      />
      <BatchCardButtons
        onPlaceBid={onPlaceBid}
        onQuickBid={onQuickBid}
      />
    </ThemedView>
  )
}

function BatchCardButtons (props: {onPlaceBid: () => void, onQuickBid: () => void}): JSX.Element {
  return (
    <ThemedView
      light={tailwind('border-gray-200')}
      dark={tailwind('border-gray-700')}
      style={tailwind('flex flex-row mt-4 flex-wrap -mb-2')}
    >
      <IconButton
        iconLabel={translate('components/BatchCard', 'PLACE BID')}
        iconSize={16}
        style={tailwind('mr-2 mb-2')}
        onPress={props.onPlaceBid}
      />
      <IconButton
        iconLabel={translate('components/BatchCard', 'QUICK BID')}
        iconSize={16}
        style={tailwind('mr-2 mb-2')}
        onPress={props.onQuickBid}
      />
    </ThemedView>
  )
}

type AuctionBidStatusType = 'lost' | 'heights'

export function AuctionBidStatus ({ type }: { type: AuctionBidStatusType }): JSX.Element {
  return (
    <View style={tailwind('flex-row w-full items-center justify-between mt-2')}>
      <View style={tailwind('flex flex-row items-center justify-between')}>
        {type === 'lost'
        ? (
          <>
            <ThemedIcon
              light={tailwind('text-warning-500')}
              dark={tailwind('text-darkwarning-500')}
              iconType='MaterialIcons'
              name='not-interested'
              size={12}
            />
            <ThemedText
              light={tailwind('text-warning-500')}
              dark={tailwind('text-darkwarning-500')}
              style={tailwind('text-xs ml-1')}
            >
              {translate('components/BatchCard', 'Your placed bid lost')}
            </ThemedText>
          </>
        )
        : (
          <>
            <ThemedIcon
              light={tailwind('text-blue-500')}
              dark={tailwind('text-darkblue-500')}
              iconType='MaterialIcons'
              name='person-pin'
              size={12}
            />
            <ThemedText
              light={tailwind('text-blue-500')}
              dark={tailwind('text-darkblue-500')}
              style={tailwind('text-xs ml-1')}
            >
              {translate('components/BatchCard', 'Your placed bid is highest')}
            </ThemedText>
          </>
        )}
      </View>
    </View>
  )
}
