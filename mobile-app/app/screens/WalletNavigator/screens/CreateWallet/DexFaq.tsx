import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function DexFaq (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/DexFaq', 'Transaction fees'),
      content: [{
        text: translate('components/DexFaq', 'Each transaction will be subject to a small amount of fees. The amount may vary depending on the network\'s congestion.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/DexFaq', 'What is slippage tolerance?'),
      content: [{
        text: translate('components/DexFaq', 'Due to the dynamic nature of the blockchain, prices on the DEX change every block.\n\nThis results in slippage, which is the difference between the final transaction price and the price displayed on the app before transaction confirmation.\n\nThe slippage tolerance feature allows you to indicate the maximum slippage you are willing to accept in a transaction.\n\nIf the slippage for your transaction is higher than your slippage tolerance, the transaction will not be completed and the original amount will be returned to your wallet.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='dex_faq'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/DexFaq', 'Decentralized Exchange')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/DexFaq', 'The decentralized exchange function will allow users of DeFiChain to swap cryptocurrencies in a peer-to-peer fashion. The decentralized exchange function matches people for trading directly, without the need to buy and sell currency through an exchange.')}
      </ThemedText>

      <WalletAccordion
        testID='dex_faq_accordian'
        activeSections={[0]}
        title={translate('components/DexFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
