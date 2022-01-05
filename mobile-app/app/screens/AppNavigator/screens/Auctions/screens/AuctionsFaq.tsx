import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function AuctionsFaq (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/AuctionsFaq', 'How is the minimum starting bid determined?'),
      content: [{
        text: translate('components/AuctionsFaq', 'The minimum starting bid is 105% of the batch\'s outstanding loan value. The additional 5% is included to cover the liquidation penalty, which is incurred upon vault liquidation.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/AuctionsFaq', 'How is the minimum next bid determined?'),
      content: [{
        text: translate('components/AuctionsFaq', 'The minimum next bid is 1% above the previous bid price.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='auctions_faq'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/AuctionsFaq', 'Auctions')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/AuctionsFaq', 'Auction is an activity where users bid on the collateral in liquidated vaults to recover the vaults\' outstanding loans. Liquidation occurs when a vault\'s collateralization ratio falls below its minimum requirement, upon which the vault collateral will be split into batches of $10,000 USD for auction.')}
      </ThemedText>

      <WalletAccordion
        testID='auctions_faq_accordion'
        title={translate('components/AuctionsFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
