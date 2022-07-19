import { ThemedScrollView, ThemedText } from '@components/themed'
import { AccordionContent, WalletAccordion } from '@components/WalletAccordion'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { LoanParamList } from '../LoansNavigator'
import { useTnC } from './LoansTnCText'

type Props = StackScreenProps<LoanParamList, 'LoansTnC'>

export function LoansTnC ({ route }: Props): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/LoansFaq', 'T&C'),
      content: [{
        text: translate('components/LoansFaq', useTnC()),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='loans_faq'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/LoansFaq', 'Decentralized Loans')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/LoansFaq', 'The decentralized loan feature allows you to borrow decentralized tokens by using your cryptocurrency holdings as collateral. To start, you must first create a vault and deposit collateral before you can take a loan.')}
      </ThemedText>

      <WalletAccordion
        testID='loans_faq_accordion'
        activeSections={[0]}
        title={translate('components/LoansFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollView>
  )
}
