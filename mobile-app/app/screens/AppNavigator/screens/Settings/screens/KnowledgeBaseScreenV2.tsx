import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigatorV2'

type Props = StackScreenProps<SettingsParamList, 'KnowledgeBaseScreen'>

export function KnowledgeBaseScreenV2 ({ navigation }: Props): JSX.Element {
  const knowledgeBaseItems = [
    {
      label: 'Auctions',
      testID: 'auctions_faq',
      onPress: () => navigation.navigate('AuctionsFaq')
    },
    {
      label: 'DEX',
      testID: 'dex_faq',
      onPress: () => navigation.navigate('DexFaq')
    },
    {
      label: 'Liquidity mining',
      testID: 'liquidity_mining_faq',
      onPress: () => navigation.navigate('LiquidityMiningFaq')
    },
    {
      label: 'Loans',
      testID: 'loans_faq',
      onPress: () => navigation.navigate({
        name: 'LoansFaq',
        params: {
          activeSessions: [0]
        }
      })
    },
    {
      label: 'Passcode',
      testID: 'passcode_faq',
      onPress: () => navigation.navigate('PasscodeFaq')
    },
    {
      label: 'Recovery words',
      testID: 'recovery_words_faq',
      onPress: () => navigation.navigate('RecoveryWordsFaq')
    },
    {
      label: 'UTXO and Tokens',
      testID: 'utxo_and_token_faq',
      onPress: () => navigation.navigate('TokensVsUtxo')
    }
  ]

  return (
    <ThemedScrollViewV2
      style={tailwind('flex-1')}
      contentContainerStyle={tailwind('px-5 pb-16')}
      testID='knowledge_base_screen'
    >
      <ThemedSectionTitleV2
        testID='knowledge_base_title'
        text={translate('screens/KnowledgeBase', 'LEARN MORE')}
      />
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-lg-v2')}
      >
        {knowledgeBaseItems.map((each, index) =>
          <NavigateItemRow key={each.label} {...each} border={index < knowledgeBaseItems.length - 1} />
        )}
      </ThemedViewV2>
    </ThemedScrollViewV2>
  )
}

function NavigateItemRow ({
  testID,
  label,
  onPress,
  border
}: { testID: string, label: string, onPress: () => void, border: boolean }): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      onPress={onPress}
      style={tailwind('flex ml-5 mr-4 py-4.5 flex-row items-center justify-between', { 'border-b': border })}
      testID={testID}
    >
      <ThemedTextV2 style={tailwind('text-sm font-normal-v2')}>
        {translate('screens/KnowledgeBase', label)}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        iconType='Feather'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacityV2>
  )
}
