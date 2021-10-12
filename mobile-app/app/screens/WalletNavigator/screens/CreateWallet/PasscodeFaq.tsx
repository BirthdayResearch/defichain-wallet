import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export function PasscodeFaq (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/PasscodeFaq', 'What happens if I forgot my passcode? Can someone help me to retrieve my passcode?'),
      content: translate('components/PasscodeFaq', 'Your passcode is your responsibility, hence no one, aside from you, knows it. It is important that you keep your passcode safe and change it from time to time.')
    },
    {
      title: translate('components/PasscodeFaq', 'Can I change my passcode?'),
      content: translate('components/PasscodeFaq', 'Yes, you can change your passcode from your settings in-app. We recommend changing of passcode regularly for maximum security.')
    },
    {
      title: translate('components/PasscodeFaq', 'Is passcode the same as phone PIN code?'),
      content: translate('components/PasscodeFaq', 'Your passcode is valid only for DeFiChain wallet.')
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
        {translate('components/PasscodeFaq', 'Your six-digit numeric code passcode, set by you, would be use to authorize all transactions. Keep your passcode private and secure. You are responsible for your own security.')}
      </ThemedText>

      <WalletAccordion
        testID='passcode_faq_accordion'
        title={translate('components/PasscodeFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
