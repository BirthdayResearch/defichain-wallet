import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export function PasscodeFaq (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/PasscodeFaq', 'What happens if I forgot my passcode? Can someone help me to retrieve my passcode?'),
      content: translate('components/PasscodeFaq', 'Your passcode is your own responsibility and no one, aside from you, knows your passcode.\n\nIt is important that you take care of your passcode and to change them from time to time.')
    },
    {
      title: translate('components/PasscodeFaq', 'Am I allowed to change my passcode?'),
      content: translate('components/PasscodeFaq', 'Yes, you can change your passcode from your settings in-app. We recommend you to change your passcode regularly for maximum security.')
    },
    {
      title: translate('components/PasscodeFaq', 'Is my passcode the same as with phone pin code?'),
      content: translate('components/PasscodeFaq', 'Your passcode is only for DeFiChain wallet.')
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
        {translate('components/PasscodeFaq', 'Your passcode is used to authorize any transaction happening in your wallet. They are a six-digit numeric code that will be asked from you every time.\n\nKeep your passcode private and secure. You are responsible for your own security.')}
      </ThemedText>

      <WalletAccordion
        testID='passcode_faq_accordion'
        title={translate('components/PasscodeFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
