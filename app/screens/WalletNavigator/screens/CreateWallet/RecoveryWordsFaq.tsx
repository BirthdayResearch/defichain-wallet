import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export function RecoveryWordsFaq (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/RecoveryWordFaq', 'What happens if I lose my recovery words?'),
      content: translate('components/RecoveryWordFaq', 'Once you lose your recovery words, you will not be able to restore your wallet and any funds within it. We encourage you to be responsible with your recovery words.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can I use the 24-words from xxx that I created from xxx?'),
      content: translate('components/RecoveryWordFaq', 'No, reusing 24-words from another computer, phone tablet, software, hardware, wallet provider will only be as secure as where you re-used it from.\n\nYou can only trust the 24-word if you can trust the device/app that generated it.\n\nYou must only enter the 24-word into a device that you trust isn\'t tamper with.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can someone help me if I lose my recovery words?'),
      content: translate('components/RecoveryWordFaq', 'No. You have sole access to your recovery words. No one is responsible and liable for it except you.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Why is it recommended to keep my recovery words offline and on paper?'),
      content: translate('components/RecoveryWordFaq', 'Storing it in digital networks could make it accessible to hackers. It is best to write it in paper and to keep it secure and private.')
    }
  ]

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='recovery_words_faq'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/RecoveryWordFaq', 'Recovery words')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/RecoveryWordFaq', 'Your unique 24 recovery words is a human-readable representation of your wallet private key, generated from a list of 2048 words in the BIP-39 standard. It prevents any attempts on brute-hacking your wallet’s security.')}
      </ThemedText>

      <WalletAccordion
        testID='recovery_words_faq_accordion'
        title={translate('components/RecoveryWordFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
