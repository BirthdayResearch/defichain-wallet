import React, { useState } from 'react'
import { ThemedText, ThemedView, ThemedIcon, ThemedScrollView } from '@components/themed'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import { translate } from '@translations'
import { getNativeIcon } from '@components/icons/assets'
import { useSelector } from 'react-redux'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootState } from '@store'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useBottomSheet } from '@hooks/useBottomSheet'
import { AuctionTimeProgress } from './components/AuctionTimeProgress'
import { StackScreenProps } from '@react-navigation/stack'
import { AuctionsParamList } from './AuctionNavigator'
import { CollateralTokenIconGroup } from './components/CollateralTokenIconGroup'
import { Tabs } from '@components/Tabs'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import BigNumber from 'bignumber.js'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { AuctionDetails } from './components/AuctionDetails'
import { AuctionedCollaterals } from './components/AuctionedCollaterals'
import { IconButton } from '@components/IconButton'
import NumberFormat from 'react-number-format'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { useAuctionBidValue } from './hooks/AuctionBidValue'
import { useAuctionTime } from './hooks/AuctionTimeLeft'
import { getActivePrice } from './helpers/ActivePrice'
import { QuickBid } from './components/QuickBid'

type BatchDetailScreenProps = StackScreenProps<AuctionsParamList, 'AuctionDetailScreen'>

enum TabKey {
  Collaterals = 'COLLATERALS',
  AuctionDetails = 'AUCTION_DETAILS'
}

export function AuctionDetailScreen (props: BatchDetailScreenProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const { batch, vault } = props.route.params
  const tokens = useTokensAPI()
  const { getVaultsUrl } = useDeFiScanContext()
  const [activeTab, setActiveTab] = useState<string>(TabKey.Collaterals)
  const { minNextBidInToken } = useAuctionBidValue(batch, vault.liquidationPenalty, vault.loanScheme.interestRate)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const { blocksRemaining } = useAuctionTime(vault.liquidationHeight, blockCount)
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen
   } = useBottomSheet()

  const onQuickBid = (): void => {
    const ownedToken = tokens.find(token => token.id === batch.loan.id)
    setBottomSheetScreen([{
      stackScreenName: 'Quick Bid',
      option: {
        header: () => null,
        headerBackTitleVisible: false
      },
      component: QuickBid({
        vaultId: vault.vaultId,
        index: batch.index,
        loanTokenId: batch.loan.id,
        loanTokenSymbol: batch.loan.symbol,
        loanTokenDisplaySymbol: batch.loan.displaySymbol,
        onCloseButtonPress: dismissModal,
        minNextBid: new BigNumber(minNextBidInToken),
        currentBalance: new BigNumber(ownedToken?.amount ?? 0),
        vaultLiquidationHeight: vault.liquidationHeight
      })
    }])
    expandModal()
  }

  const onPlaceBid = (): void => {
    navigation.navigate('PlaceBidScreen', {
      batch,
      vault
    })
  }

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

  return (
    <View style={tailwind('flex-1')} ref={containerRef}>
      <ThemedScrollView style={tailwind('pb-28')}>
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('rounded border-b p-4')}
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
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
          <AuctionedCollaterals
            collaterals={batch.collaterals}
            auctionAmount={new BigNumber(batch.loan.amount).multipliedBy(getActivePrice(batch.loan)).toFixed(2)}
          />
        )}

        {activeTab === TabKey.AuctionDetails && (
          <AuctionDetails vault={vault} batch={batch} />
        )}

      </ThemedScrollView>
      <AuctionActionSection
        minNextBidInToken={minNextBidInToken}
        displaySymbol={batch.loan.displaySymbol}
        blocksRemaining={blocksRemaining}
        onQuickBid={onQuickBid}
        onPlaceBid={onPlaceBid}
      />

      {Platform.OS === 'web' && (
        <BottomSheetWebWithNav
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
        />
      )}

      {Platform.OS !== 'web' && (
        <BottomSheetWithNav
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: '40%',
            android: '40%'
          }}
        />
      )}
    </View>
  )
}

interface AuctionActionSectionProps {
  minNextBidInToken: string
  displaySymbol: string
  blocksRemaining: number
  onQuickBid: () => void
  onPlaceBid: () => void
}

function AuctionActionSection (props: AuctionActionSectionProps): JSX.Element {
  const nextBidInfo = {
    title: 'Min. next bid',
    message: 'The minimum bid a user must place, as long as it’s not the first bid for the batch'
  }

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('absolute w-full bottom-0 flex-1 border-t px-4 pt-5 pb-10')}
    >
      <View style={tailwind('flex flex-row items-center justify-center w-full')}>
        <View style={tailwind('w-6/12')}>
          <View style={tailwind('flex-row items-center')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-sm items-center')}
            >
              {translate('screens/AuctionDetailScreen', 'Min. next bid')}
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
            suffix={` ${props.displaySymbol}`}
            displayType='text'
            renderText={(value) =>
              <ThemedText
                dark={tailwind('text-gray-50')}
                light={tailwind('text-gray-900')}
                style={tailwind('font-semibold')}
                testID='total_auction_value'
              >
                {value}
              </ThemedText>}
            thousandSeparator
            value={props.minNextBidInToken}
          />
        </View>
      </View>
      <View
        style={tailwind('flex flex-row mt-6 items-center justify-center')}
      >
        <IconButton
          iconLabel={translate('components/AuctionDetailScreen', 'QUICK BID')}
          iconSize={16}
          style={tailwind('mr-1 w-1/2 justify-center p-2 rounded-sm')}
          onPress={props.onQuickBid}
          disabled={props.blocksRemaining === 0}
          textStyle={tailwind('text-base')}
        />
        <IconButton
          iconLabel={translate('components/AuctionDetailScreen', 'PLACE BID')}
          iconSize={16}
          style={tailwind('ml-1 w-1/2 justify-center p-2 rounded-sm bg-primary-50')}
          onPress={props.onPlaceBid}
          disabled={props.blocksRemaining === 0}
          themedProps={{
            light: tailwind('bg-primary-50 border-primary-50'),
            dark: tailwind('bg-darkprimary-700 border-darkprimary-700')
          }}
          textStyle={tailwind('text-base')}
          textThemedProps={{
            light: tailwind('text-primary-500'),
            dark: tailwind('text-white')
          }}
        />
      </View>
    </ThemedView>
  )
}
