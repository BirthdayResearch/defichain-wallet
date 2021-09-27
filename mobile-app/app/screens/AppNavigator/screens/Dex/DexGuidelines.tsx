import { MaterialIcons } from '@expo/vector-icons'
import * as React from 'react'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

interface Props {
  onClose: () => void
}

interface GuidelineItem {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  title: string
  subtitle: string
}

// TODO (Harsh): handle language change bug, when user change the language, sometime it didnt get update the satic page
export function DexGuidelines ({ onClose }: Props): JSX.Element {
  const guidelines: GuidelineItem[] = [
    {
      title: 'Add liquidity',
      subtitle: 'Earn high yields by supplying token pairs to the liquidity pool.',
      icon: 'add'
    },
    {
      title: 'Swap tokens',
      subtitle: 'Conveniently swap participating tokens within the liquidity pool.',
      icon: 'swap-horiz'
    },
    {
      title: 'Withdraw at any time',
      subtitle: 'You have full control over your tokens unlike any other.',
      icon: 'account-balance-wallet'
    }
  ]

  return (
    <ThemedScrollView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('flex-1 p-4 pt-6')}
      testID='dex_guidelines_screen'
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('screens/DexGuidelines', 'Decentralized Exchange')}
      </ThemedText>

      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('mt-1 text-sm font-medium mb-4')}
      >
        {translate('screens/DexGuidelines', 'Participate in supplying liquidity to power the DEX (Decentralized Exchange). Use your tokens to earn high returns (of up to 100%).')}
      </ThemedText>

      {
        guidelines.map((g, i) => (
          <View
            key={i}
            style={tailwind('flex-row items-center my-4')}
          >
            <ThemedIcon
              iconType='MaterialIcons'
              name={g.icon}
              size={32}
            />

            <View style={tailwind('flex-col flex-auto ml-6')}>
              <ThemedText style={tailwind('font-medium')}>
                {translate('screens/DexGuidelines', g.title)}
              </ThemedText>

              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                numberOfLines={4}
                style={tailwind('text-sm')}
              >
                {translate('screens/DexGuidelines', g.subtitle)}
              </ThemedText>
            </View>
          </View>
        ))
      }

      <Button
        label={translate('screens/DexGuidelines', 'CONTINUE')}
        margin='mx-0 mt-10 mb-8'
        onPress={onClose}
        testID='close_dex_guidelines'
        title={translate('screens/DexGuidelines', 'CONTINUE')}
      />
    </ThemedScrollView>
  )
}
