import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { WalletAccordionV2, AccordionContent } from '@components/WalletAccordionV2'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function TokensVsUtxoFaqV2 (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/UtxoVsTokenFaq', 'What are UTXOs?'),
      content: [{
        text: translate('components/UtxoVsTokenFaq', 'DFI in UTXO form is the primary form of DFI. It is used for core cryptocurrency purposes such as send, receive and fees.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/UtxoVsTokenFaq', 'What are the use cases for UTXO?'),
      content: [{
        text: translate('components/UtxoVsTokenFaq', 'Use cases for UTXO include (but not limited) to the following:'),
        type: 'paragraph'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Sending DFI to other wallets'),
        type: 'bullet'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Receiving DFI from other wallets'),
        type: 'bullet'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Transaction fees'),
        type: 'bullet'
      }]
    },
    {
      title: translate('components/UtxoVsTokenFaq', 'What are Tokens?'),
      content: [{
        text: translate('components/UtxoVsTokenFaq', 'DFIs in token form are used for various DeFiChain functions such as Liquidity Pools, Loans, Auctions and DEX swaps.'),
        type: 'paragraph'
      }
    ]
    },
    {
      title: translate('components/UtxoVsTokenFaq', 'What are the use cases for Tokens?'),
      content: [{
        text: translate('components/UtxoVsTokenFaq', 'Use cases for Tokens include (but not limited) to the following:'),
        type: 'paragraph'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Swapping DFI with other tokens (e.g. dBTC, dETH, dUSDT)'),
        type: 'bullet'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Liquidity pools'),
        type: 'bullet'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Collateral for Vaults'),
        type: 'paragraph'
      }, {
        text: translate('components/UtxoVsTokenFaq', 'Auction bidding'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='utxo_vs_token_faq'
    >
      <ThemedTextV2
        style={tailwind('text-base font-normal-v2 px-5')}
      >
        {translate('components/UtxoVsTokenFaq', 'DFI exists in two forms: UTXO and Token. They can be converted with one another to serve different use cases within your light wallet.')}
      </ThemedTextV2>

      <WalletAccordionV2
        testID='loans_faq_accordion'
        title={translate('components/UtxoVsTokenFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  )
}
