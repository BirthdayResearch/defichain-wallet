import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { AccordionContent, WalletAccordionV2 } from '@components/WalletAccordionV2'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function PasscodeFaqV2 (): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/PasscodeFaq', 'What happens if I forgot my passcode? Can someone help me to retrieve my passcode?'),
      content: [{
        text: translate('components/PasscodeFaq', 'Your passcode is your responsibility, hence no one, aside from you, knows it. It is important that you keep your passcode safe and change it from time to time.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/PasscodeFaq', 'Can I change my passcode?'),
      content: [{
        text: translate('components/PasscodeFaq', 'Yes, you can change your passcode from your settings in-app. We recommend changing of passcode regularly for maximum security.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/PasscodeFaq', 'Is passcode the same as phone PIN code?'),
      content: [{
        text: translate('components/PasscodeFaq', 'Your passcode is valid only for DeFiChain wallet.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='passcode_faq'
    >
      <ThemedTextV2
        style={tailwind('text-base font-normal-v2 px-5')}
      >
        {translate('components/PasscodeFaq', 'Your six-digit numeric passcode, set by you, would be used to authorize all transactions. Keep your passcode private and secure. You are responsible for your own security.')}
      </ThemedTextV2>

      <WalletAccordionV2
        testID='passcode_faq_accordion'
        activeSections={[0]}
        title={translate('components/PasscodeFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  )
}
