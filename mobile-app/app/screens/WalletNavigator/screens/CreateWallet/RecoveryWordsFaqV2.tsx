import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { AccordionContent, WalletAccordionV2 } from '@components/WalletAccordionV2'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function RecoveryWordsFaqV2 (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/RecoveryWordFaq', 'What happens if I lose my recovery words?'),
      content: [{
        text: translate('components/RecoveryWordFaq', 'Once you lose your recovery words, you will not be able to restore your wallet and any funds within it. We encourage you to be responsible with your recovery words.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can I use the 24-word from xxx that I created from xxx?'),
      content: [{
        text: translate('components/RecoveryWordFaq', 'You can only reuse the 24-words if it\'s created from the Jellyfish ecosystem.\n\nThe compatible clients are DeFiChain Wallet (Android/iOS) and DFX.SWISS (Android/iOS).\n\nHowever, it is highly discouraged that you reuse it. Your 24-words are only as secure as the source computer / device / app that generates it. If your source is comprised, so are your 24-words. Essentially, one set of 24-words per device / computer / app is encouraged.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can someone help me if I lose my recovery words?'),
      content: [{
        text: translate('components/RecoveryWordFaq', 'No. You have sole access to your recovery words. No one is responsible and liable for it except you.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/RecoveryWordFaq', 'Why is it recommended to keep my recovery words offline and in paper?'),
      content: [{
        text: translate('components/RecoveryWordFaq', 'Storing it in digital networks could make it accessible to hackers. It is best to write it in paper and to keep it secure and private.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='recovery_words_faq'
    >
      <ThemedTextV2
        style={tailwind('text-base font-normal-v2 px-5')}
      >
        {translate('components/RecoveryWordFaq', 'Your unique 24 recovery words is a human-readable representation of your wallet private key, generated from a list of 2048 words in the BIP-39 standard. It prevents any attempts on brute-hacking your wallet’s security.')}
      </ThemedTextV2>

      <WalletAccordionV2
        testID='recovery_words_faq_accordion'
        activeSections={[0]}
        title={translate('components/RecoveryWordFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  )
}
