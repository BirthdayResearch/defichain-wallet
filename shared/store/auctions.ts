import BigNumber from 'bignumber.js'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch, VaultAuctionBatchHistory } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuctionTabGroupKey } from '@screens/AppNavigator/screens/Auctions/components/BrowseAuctions'
import { LoansState } from './loans'

export interface AuctionsState {
  auctions: LoanVaultLiquidated[]
  hasFetchAuctionsData: boolean
  bidHistory: VaultAuctionBatchHistory[]
}

export interface AuctionBatchProps extends LoanVaultLiquidationBatch {
  auction: LoanVaultLiquidated
}

const initialState: AuctionsState = {
  auctions: [],
  hasFetchAuctionsData: false,
  bidHistory: []
}

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  async ({
    size = 200,
    client
  }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listAuction(size)
  }
)

export const fetchBidHistory = createAsyncThunk(
  'wallet/fetchBidHistory',
  async ({
    vaultId,
    liquidationHeight,
    batchIndex,
    client,
    size = 200
  }: { vaultId: string, liquidationHeight: number, batchIndex: number, client: WhaleApiClient, size: number}) => {
    return await client.loan.listVaultAuctionHistory(vaultId, liquidationHeight, batchIndex, size)
  }
)

export const auctions = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    resetBidHistory: (state) => {
      state.bidHistory = []
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<LoanVaultLiquidated[]>) => {
      state.auctions = action.payload
      state.hasFetchAuctionsData = true
    })
    builder.addCase(fetchBidHistory.fulfilled, (state, action: PayloadAction<VaultAuctionBatchHistory[]>) => {
      state.bidHistory = action.payload
    })
  }
})

/**
 * Flattens the auctions -> batch
 * Filters by search term
 * Sorts by liquidation height
 */

interface AuctionFilterAndGroup {
  searchTerm: string
  activeAuctionTabGroupKey: AuctionTabGroupKey
  walletAddress: string
}
 export const auctionsSearchByFilterSelector = createSelector([
  (state: AuctionsState) => state.auctions,
  (_state: AuctionsState, loansState: LoansState) => loansState.vaults,
  (_state: AuctionsState, _vaults: LoansState, filters: AuctionFilterAndGroup) => filters
  ],
  (auctions, vaults, filters) => {
    const hasNoSearchTerm = filters.searchTerm === '' || filters.searchTerm === undefined
    return auctions
    .reduce<AuctionBatchProps[]>((auctionBatches, auction): AuctionBatchProps[] => {
      const filteredAuctionBatches = auctionBatches
      auction.batches.forEach(batch => {
        const isIncludedInSearchTerm = hasNoSearchTerm || (filters.searchTerm !== '' && filters.searchTerm !== undefined && batch.loan.displaySymbol.toLowerCase().includes(filters.searchTerm.trim().toLowerCase()))
        const hasPlacedBid = batch.froms.some(bidder => bidder === filters.walletAddress)
        const isVaultOwner = vaults.some(vault => vault.vaultId === auction.vaultId)
        if (isIncludedInSearchTerm && isVaultOwner && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.FromYourVault) {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        } else if (isIncludedInSearchTerm && hasPlacedBid && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.WithPlacedBids) {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        } else if (isIncludedInSearchTerm && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.AllAuctions) {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        }
      })

      return filteredAuctionBatches
    }, [])
    .sort((a, b) => {
      const hasPlacedBidA = a.froms.some(bidder => bidder === filters.walletAddress) ? 1 : 0
      const hasPlacedBidB = b.froms.some(bidder => bidder === filters.walletAddress) ? 1 : 0
      const hasHighestBidA = a.highestBid?.owner === filters.walletAddress ? 1 : 0
      const hasHighestBidB = b.highestBid?.owner === filters.walletAddress ? 1 : 0
      return (
        hasHighestBidA - hasHighestBidB ??
        hasPlacedBidA - hasPlacedBidB ??
        new BigNumber(a.auction.liquidationHeight).minus(b.auction.liquidationHeight).toNumber()
      )
    })
  }
)
