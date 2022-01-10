
import { ThemedText, ThemedView } from '../../../../../components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { IconButton } from '@components/IconButton'
import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { AuctionTimeProgress } from './AuctionTimeProgress'

export interface BidCardProps {
  vaultId: string
  batch: LoanVaultLiquidationBatch
  liquidationHeight: number
  testID?: string
}

export function BidCard (props: BidCardProps): JSX.Element {
  const { batch, liquidationHeight, testID } = props
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
      testID={testID}
    >
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {translate('components/BidCard', 'Bid amount')}
      </ThemedText>
      <NumberFormat
        displayType='text'
        suffix={` ${batch.loan.displaySymbol}`}
        renderText={(value: string) => (
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('font-semibold mb-3')}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        value={batch.loan.amount}
      />

      <AuctionTimeProgress
        liquidationHeight={liquidationHeight}
        blockCount={blockCount}
        label='Auction ends in'
        auctionTextStyle={tailwind('text-xs')}
      />
      <ThemedView
        light={tailwind('border-gray-200')}
        dark={tailwind('border-gray-700')}
        style={tailwind('flex flex-row mt-4 flex-wrap -mb-2')}
      >
        <IconButton
          iconLabel={translate('components/BidCard', 'BID AGAIN')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => { }}
        />
        <IconButton
          iconLabel={translate('components/BidCard', 'QUICK BID')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => { }}
        />
      </ThemedView>
    </ThemedView>
  )
}
