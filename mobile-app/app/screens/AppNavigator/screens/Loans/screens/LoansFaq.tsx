import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { WalletAccordionV2, AccordionContent } from '@components/WalletAccordionV2'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { LoanParamList } from '../LoansNavigator'

type Props = StackScreenProps<LoanParamList, 'LoansFaq'>

export function LoansFaq ({ route }: Props): JSX.Element {
  const activeSessions = route.params.activeSessions
  const faqContent: AccordionContent[] = [
    {
      title: translate('components/LoansFaq', 'How is the collateralization ratio calculated?'),
      content: [{
        text: translate('components/LoansFaq', 'The collateralization ratio is calculated by taking the total collateral value deposited in a vault; divided by the amount of loan taken plus total interest, expressed in percentage.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/LoansFaq', 'What is the collateralization ratio used for?'),
      content: [{
        text: translate('components/LoansFaq', 'The collateralization ratio determines the state of the vault. A ratio below the minimum collateralization ratio results in liquidation, upon which, a vault\'s collateral will be sent for auction.'),
        type: 'paragraph'
      }, {
        text: translate('components/LoansFaq', 'Indicators have been included to help visualise the health of your vault, where:'),
        type: 'paragraph'
      }, {
        text: translate('components/LoansFaq', 'Red: 1x – 1.25x above the minimum collateralization ratio'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Yellow: 1.25x – 1.5x the minimum collateralization ratio'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Green: More than 1.5x the minimum collateralization ratio'),
        type: 'bullet'
      }]
    },
    {
      title: translate('components/LoansFaq', 'What do the different statuses of a vault mean?'),
      content: [{
        text: translate('components/LoansFaq', 'Empty: When a vault has been created but no collateral has been deposited yet.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Ready: When collateral has been deposited into the vault, but no loan has been taken yet.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Active (Red): When the collateralization ratio of a vault is between 1x – 1.25x the minimum collateralization ratio.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Active (Orange): When the collateralization ratio of a vault is between 1.25x – 1.5x the minimum collateralization ratio.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Active (Green):  When the collateralization ratio of a vault is more than 1.5x the minimum collateralization ratio.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'In liquidation: When a vault\'s collateralization ratio falls below the minimum requirement.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'Halted: When any token in the vault (collateral or loan) has fluctuated more than 30% in the past hour.'),
        type: 'bullet'
      }
    ]
    },
    {
      title: translate('components/LoansFaq', 'How are interests calculated for loan?'),
      content: [{
        text: translate('components/LoansFaq', 'There are 2 types of interests that applies for loans, namely vault interest rate and token interest rate.'),
        type: 'paragraph'
      }, {
        text: translate('components/LoansFaq', 'The vault interest rate is determined when the vault owner selects the vault scheme, where the higher the minimum collateralization ratio, the lower the vault interest rate.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'The token interest rate is applied on specific loan tokens, and can differ from token to token.'),
        type: 'bullet'
      }, {
        text: translate('components/LoansFaq', 'The total interest rate applied on a loan is derived by taking the vault interest rate + token interest rate, and is calculated on a per annum basis.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/LoansFaq', 'What is collateral factor?'),
      content: [{
        text: translate('components/LoansFaq', 'The collateral factor determines the degree of contribution of each collateral token. For example, if a token is accepted at 70% collateral factor, $100 worth of the token would contribute to $70 of collateral value in a vault.'),
        type: 'paragraph'
      }]
    },
    {
      title: translate('components/LoansFaq', 'What is vault share?'),
      content: [{
        text: translate('components/LoansFaq', 'The vault share represents the proportion of collateral tokens deposited in a vault. It is required for all vaults to contain at least 50% of DFI and/or DUSD as collateral tokens. This requirement is checked on 2 occasions – when you\'re minting new dTokens and when you are withdrawing collateral from your vault.'),
        type: 'paragraph'
      }]
    }
  ]

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='loans_faq'
    >
      <ThemedTextV2
        style={tailwind('text-base font-normal-v2 px-5')}
      >
        {translate('components/LoansFaq', 'The decentralized loan feature allows you to borrow decentralized tokens by using your cryptocurrency holdings as collateral. To start, you must first create a vault and deposit collateral before you can take a loan.')}
      </ThemedTextV2>

      <WalletAccordionV2
        testID='loans_faq_accordion'
        activeSections={activeSessions}
        title={translate('components/LoansFaq', 'FREQUENTLY ASKED QUESTIONS')}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  )
}
