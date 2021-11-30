import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView, ThemedTouchableOpacity, ThemedIcon } from '@components/themed'
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

export interface BatchCardProps {
  vault: LoanVaultLiquidated
  batch: LoanVaultLiquidationBatch
  testID?: string
}

export function BatchCard (props: BatchCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const { batch, testID, vault } = props
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  const nextBidInfo = {
    title: 'Min. next bid',
    message: 'The minimum bid a user must place, as long as it’s not the first bid for the batch'
  }

  const onCardPress = (): void => {
    navigation.navigate('BatchDetailScreen', {
      batch,
      vaultId: vault.vaultId
    })
  }

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <ThemedTouchableOpacity
        testID={testID}
        onPress={onCardPress}
        light={tailwind('border-b-0')}
        dark={tailwind('border-b-0')}
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
              <ThemedIcon
                style={tailwind('ml-2')}
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={18}
              />
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
        <AuctionBidStatus type='heights' />
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
              value={new BigNumber(batch.loan.amount).multipliedBy(batch.loan.activePrice?.active?.amount ?? 0).toFixed(2)}
            />
          </View>
        </View>

        <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
          <View style={tailwind('flex flex-row')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs')}
            >
              {translate('components/BatchCard', 'Latest bid')}
            </ThemedText>
          </View>
          <View style={tailwind('flex flex-row')}>
            {batch.highestBid === undefined
              ? (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('text-sm')}
                >
                  {translate('components/BatchCard', 'N/A')}
                </ThemedText>
              )
              : (
                <NumberFormat
                  suffix={` ${batch.loan.displaySymbol}`}
                  displayType='text'
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
                  value={new BigNumber(batch.highestBid.amount.amount).toFixed(8)}
                />
              )}
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
          {/*  TODO calculate next bid price */}
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
              value={0}
            />
          </View>
        </View>
      </ThemedTouchableOpacity>

      <AuctionTimeProgress
        liquidationHeight={vault.liquidationHeight}
        blockCount={blockCount}
        label='Auction time left'
      />
      <BatchCardButtons />
    </ThemedView>
  )
}

function BatchCardButtons (): JSX.Element {
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
        onPress={() => {}}
      />
      <IconButton
        iconLabel={translate('components/BatchCard', 'QUICK BID')}
        iconSize={16}
        style={tailwind('mr-2 mb-2')}
        onPress={() => {}}
      />
    </ThemedView>
  )
}

type AuctionBidStatusType = 'lost' | 'heights'

function AuctionBidStatus ({ type }: { type: AuctionBidStatusType }): JSX.Element {
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
