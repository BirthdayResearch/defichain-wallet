import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export function PasscodeFaq (): JSX.Element {
  // TODO(kyleleow): update faq content, add translation
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/PasscodeFaq', 'What happens if I forgot my passcode?'),
      content: translate('components/PasscodeFaq', '')
    },
    {
      title: translate('components/PasscodeFaq', 'Am I allowed to change my passcode?'),
      content: translate('components/PasscodeFaq', '')
    },
    {
      title: translate('components/PasscodeFaq', 'Can I use the 24-word that I created from another wallet?'),
      content: translate('components/PasscodeFaq', '')
    }
  ]

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='passcode_faq'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/PasscodeFaq', 'Passcode')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/PasscodeFaq', 'Your passcode is used to authorize any transaction happening in your wallet.')}
      </ThemedText>

      <WalletAccordion
        testID='passcode_faq_accordion'
        title={translate('components/PasscodeFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
