import React, { useState } from 'react'
import { ThemedText, ThemedView, ThemedIcon, ThemedScrollView, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from 'react-native'
import { translate } from '@translations'
import { getNativeIcon } from '@components/icons/assets'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { AuctionTimeProgress } from './components/AuctionTimeProgress'
import { StackScreenProps } from '@react-navigation/stack'
import { AuctionsParamList } from './AuctionNavigator'
import { CollateralTokenIconGroup } from './components/CollateralTokenIconGroup'
import { Tabs } from '@components/Tabs'
import BigNumber from 'bignumber.js'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { AuctionDetails } from './components/AuctionDetails'
import { AuctionCollaterals } from './components/AuctionCollaterals'
import { IconButton } from '@components/IconButton'
import NumberFormat from 'react-number-format'
import { BottomSheetInfo } from '@components/BottomSheetInfo'

type BatchDetailScreenProps = StackScreenProps<AuctionsParamList, 'AuctionDetailScreen'>

enum TabKey {
  Collaterals = 'COLLATERALS',
  AuctionDetails = 'AUCTION_DETAILS'
}

export function AuctionDetailScreen (props: BatchDetailScreenProps): JSX.Element {
  const { batch, vault } = props.route.params
  const { getVaultsUrl } = useDeFiScanContext()
  const [activeTab, setActiveTab] = useState<string>(TabKey.Collaterals)

  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }

  const tabsList = [{
    id: TabKey.Collaterals,
    label: 'Auctioned collaterals',
    disabled: false,
    handleOnPress: onPress
  }, {
    id: TabKey.AuctionDetails,
    label: 'Auction details',
    disabled: false,
    handleOnPress: onPress
  }]

  const nextBidInfo = {
    title: 'Min. next bid',
    message: 'The minimum bid a user must place, as long as it’s not the first bid for the batch'
  }

  return (
    <View style={tailwind('flex-1')}>
      <ThemedScrollView style={tailwind('mb-24')}>
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('rounded border p-4')}
          testID='batch_detail_screen'
        >
          <View style={tailwind('flex-row w-full items-center justify-between mb-4')}>
            <View style={tailwind('flex flex-row items-center')}>
              <ThemedView
                light={tailwind('bg-gray-100')}
                dark={tailwind('bg-gray-700')}
                style={tailwind('w-8 h-8 rounded-full items-center justify-center')}
              >
                <LoanIcon height={32} width={32} />
              </ThemedView>
              <View style={tailwind('flex flex-row ml-2')}>
                <View style={tailwind('flex')}>
                  <ThemedText style={tailwind('font-semibold text-sm')}>
                    {batch.loan.displaySymbol}
                  </ThemedText>
                  <View style={tailwind('flex flex-row items-center')}>
                    <ThemedText
                      light={tailwind('text-gray-500')}
                      dark={tailwind('text-gray-400')}
                      style={tailwind('text-xs')}
                    >
                      {translate('components/AuctionDetailScreen', 'Batch #{{index}}', { index: 1 })}
                    </ThemedText>
                    <ThemedTouchableOpacity
                      onPress={async () => await openURL(getVaultsUrl(vault.vaultId))}
                      testID='ocean_vault_explorer'
                    >
                      <ThemedIcon
                        dark={tailwind('text-darkprimary-500')}
                        iconType='MaterialIcons'
                        light={tailwind('text-primary-500')}
                        name='open-in-new'
                        style={tailwind('ml-1')}
                        size={12}
                      />
                    </ThemedTouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={tailwind('flex flex-row')}>
              <CollateralTokenIconGroup
                maxIconToDisplay={3}
                title={translate('components/AuctionDetailScreen', 'Collaterals')}
                symbols={batch.collaterals.map(collateral => collateral.displaySymbol)}
              />
            </View>
          </View>

          <AuctionTimeProgress
            liquidationHeight={vault.liquidationHeight}
            blockCount={blockCount}
            label='Auction time remaining'
          />

        </ThemedView>
        <Tabs tabSections={tabsList} testID='auctions_tabs' activeTabKey={activeTab} />
        {activeTab === TabKey.Collaterals && (
          <AuctionCollaterals
            collaterals={batch.collaterals}
            auctionAmount={new BigNumber(batch.loan.amount).multipliedBy(batch.loan.activePrice?.active?.amount ?? 0).toFixed(2)}
          />
        )}

        {activeTab === TabKey.AuctionDetails && (
          <AuctionDetails vault={vault} batch={batch} />
        )}

      </ThemedScrollView>
      {/* TODO calculate Min. starting bid */}
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('absolute w-full bottom-0 flex-1 border p-4')}
      >
        <View style={tailwind('flex flex-row items-center justify-center w-full')}>
          <View style={tailwind('w-6/12')}>
            <View style={tailwind('flex-row items-center')}>
              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind('text-sm items-center')}
              >
                {translate('components/BatchDetailsScreen', 'Min. starting bid')}
              </ThemedText>
              <View style={tailwind('ml-1')}>
                <BottomSheetInfo alertInfo={nextBidInfo} name={nextBidInfo.title} infoIconStyle={tailwind('text-sm')} />
              </View>
            </View>
          </View>
          <View
            style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
          >
            <NumberFormat
              decimalScale={8}
              suffix={` ${batch.loan.displaySymbol}`}
              displayType='text'
              renderText={(value) =>
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('font-medium -mr-2')}
                  testID='total_auction_value'
                >
                  {value}
                </ThemedText>}
              thousandSeparator
              value='0'
            />
          </View>
        </View>
        <View
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('flex flex-row mt-4 items-center justify-center')}
        >
          <IconButton
            iconLabel={translate('components/AuctionDetailScreen', 'QUICK BID')}
            iconSize={16}
            style={tailwind('mr-2 w-1/2 justify-center')}
            onPress={() => {}}
          />
          <IconButton
            iconLabel={translate('components/AuctionDetailScreen', 'PLACE BID')}
            iconSize={16}
            style={tailwind('mr-2 w-1/2 justify-center')}
            onPress={() => {}}
          />
        </View>
      </ThemedView>
    </View>
  )
}
