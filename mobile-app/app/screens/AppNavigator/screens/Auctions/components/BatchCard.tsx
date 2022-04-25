import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity } from 'react-native'
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
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import { useAuctionBidValue } from '../hooks/AuctionBidValue'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { MaterialIcons } from '@expo/vector-icons'
import { MinNextBidTextRow } from './MinNextBidTextRow'
import { onQuickBidProps } from './BrowseAuctions'

export interface BatchCardProps {
  vault: LoanVaultLiquidated
  batch: LoanVaultLiquidationBatch
  testID: string
  onQuickBid: (props: onQuickBidProps) => void
  isVaultOwner: boolean
}

export function BatchCard (props: BatchCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const { address } = useWalletContext()
  const { getVaultsUrl } = useDeFiScanContext()
  const {
    batch,
    testID,
    vault
  } = props
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const {
    minNextBidInToken,
    totalCollateralsValueInUSD,
    hasFirstBid,
    minNextBidInUSD
  } = useAuctionBidValue(batch, vault.liquidationPenalty)

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
    props.onQuickBid({
      batch: batch,
      vaultId: vault.vaultId,
      minNextBidInToken,
      minNextBidInUSD,
      vaultLiquidationHeight: vault.liquidationHeight
    })
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
              <ThemedText testID={`batch_${batch.index}_${batch.loan.displaySymbol}`} style={tailwind('font-semibold flex-shrink')}>
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
        <View style={tailwind('flex flex-row', { 'mt-0.5': props.isVaultOwner || !hasFirstBid })}>
          {props.isVaultOwner && <BatchCardInfo testID={`${testID}_owned_vault`} iconName='account-circle' text='From your vault' />}
          {!hasFirstBid && <BatchCardInfo testID={`${testID}_no_bid`} iconName='hourglass-top' text='Waiting for first bid' />}
        </View>
        {batch?.highestBid?.owner === address && <AuctionBidStatus testID={testID} type='highest' />}
        <View style={tailwind('flex-row w-full items-center justify-between my-2')}>
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
              value={totalCollateralsValueInUSD}
            />
          </View>
        </View>

        <MinNextBidTextRow
          displaySymbol={batch.loan.displaySymbol}
          minNextBidInToken={minNextBidInToken}
          minNextBidInUSD={minNextBidInUSD}
          testID={`batch_${batch.index}_min_next_bid`}
        />
      </TouchableOpacity>

      <AuctionTimeProgress
        liquidationHeight={vault.liquidationHeight}
        blockCount={blockCount}
        label='Auction time remaining'
      />
      <BatchCardButtons
        onPlaceBid={onPlaceBid}
        onQuickBid={onQuickBid}
        testID={testID}
      />
    </ThemedView>
  )
}

const BatchCardInfo = memo((props: { iconName: React.ComponentProps<typeof MaterialIcons>['name'], text: string, testID: string }): JSX.Element => {
  return (
    <View style={tailwind('flex flex-row items-center')}>
      <ThemedIcon
        size={12}
        name={props.iconName}
        iconType='MaterialIcons'
        style={tailwind('mr-1')}
        dark={tailwind('text-gray-200')}
        light={tailwind('text-gray-700')}
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-2xs mr-2 leading-3')}
        testID={props.testID}
      >{translate('components/BatchCard', props.text)}
      </ThemedText>
    </View>
  )
})

const BatchCardButtons = memo((props: { onPlaceBid: () => void, onQuickBid: () => void, testID: string }): JSX.Element => {
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
        testID={`${props.testID}_place_bid_button`}
      />
      <IconButton
        iconLabel={translate('components/QuickBid', 'QUICK BID')}
        iconSize={16}
        style={tailwind('mr-2 mb-2')}
        onPress={props.onQuickBid}
        testID={`${props.testID}_quick_bid_button`}
      />
    </ThemedView>
  )
})

type AuctionBidStatusType = 'lost' | 'highest'

export const AuctionBidStatus = memo(({ type, testID }: { type: AuctionBidStatusType, testID: string }): JSX.Element => {
  return (
    <View style={tailwind('flex-row w-full items-center justify-between')}>
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
                testID={`${testID}_lost_text`}
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
                style={tailwind('mr-1 mt-0.5')}
              />
              <ThemedText
                light={tailwind('text-blue-500')}
                dark={tailwind('text-darkblue-500')}
                style={tailwind('text-2xs mr-2')}
                testID={`${testID}_highest_text`}
              >
                {translate('components/BatchCard', 'You are the highest bidder')}
              </ThemedText>
            </>
          )}
      </View>
    </View>
  )
})
