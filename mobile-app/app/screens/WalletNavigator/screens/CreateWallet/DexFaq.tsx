import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { AccordionContent, WalletAccordionV2 } from '@components/WalletAccordionV2'
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
        text: translate('components/DexFaq', 'Due to the dynamic nature of the blockchain, prices on the DEX change every block.\n\nThis results in slippage, which is the difference between the final transaction price and the price displayed on the app before transaction confirmation.\n\nNote that the slippage tolerance also includes the DEX Stabilization fees which was introduced as per DFIP-2206-D.\n\nThe slippage tolerance feature allows you to indicate the maximum slippage you are willing to accept in a transaction.\n\nIf the slippage for your transaction is higher than your slippage tolerance, the transaction will not be completed and the original amount will be returned to your wallet.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='dex_faq'
    >

      <ThemedTextV2
        style={tailwind('text-base font-normal-v2 px-5')}
      >
        {translate('components/DexFaq', 'The decentralized exchange function will allow users of DeFiChain to swap cryptocurrencies in a peer-to-peer fashion. The decentralized exchange function matches people for trading directly, without the need to buy and sell currency through an exchange.')}
      </ThemedTextV2>

      <WalletAccordionV2
        testID='dex_faq_accordian'
        activeSections={[0]}
        title={translate('components/DexFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  )
}
