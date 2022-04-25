import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity
} from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'KnowledgeBaseScreen'>

export function KnowledgeBaseScreen ({ navigation }: Props): JSX.Element {
  const knowledgeBaseItems = [
    {
      label: 'Recovery words',
      testID: 'recovery_words_faq',
      onPress: () => navigation.navigate('RecoveryWordsFaq')
    }, {
      label: 'Passcode',
      testID: 'passcode_faq',
      onPress: () => navigation.navigate('PasscodeFaq')
    }, {
      label: 'UTXO vs Token',
      testID: 'utxo_and_token_faq',
      onPress: () => navigation.navigate('TokensVsUtxo')
    },
    {
      label: 'DEX',
      testID: 'dex_faq',
      onPress: () => navigation.navigate('DexFaq')
    },
    {
      label: 'Liquidity Mining',
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
      label: 'Auctions',
      testID: 'auctions_faq',
      onPress: () => navigation.navigate('AuctionsFaq')
    }
  ]

  return (
    <ThemedScrollView
      style={tailwind('flex-1 pb-8')}
      testID='knowledge_base_screen'
    >
      <ThemedSectionTitle
        testID='knowledge_base_title'
        text={translate('screens/KnowledgeBase', 'LEARN ABOUT')}
      />

      {knowledgeBaseItems.map((each) =>
        <NavigateItemRow key={each.label} {...each} />
      )}
    </ThemedScrollView>
  )
}

function NavigateItemRow ({
  testID,
  label,
  onPress
}: { testID: string, label: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex p-4 pr-2 flex-row items-center justify-between')}
      testID={testID}
    >
      <ThemedText style={tailwind('font-medium')}>
        {translate('screens/KnowledgeBase', label)}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
