import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import { useCallback } from 'react'
import { Linking } from 'react-native'
import { View } from '@components/index'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function CommunityScreen (): JSX.Element {
  return (
    <ThemedFlatList
      ItemSeparatorComponent={
        () => (
          <ThemedView
            dark={tailwind('bg-gray-700')}
            light={tailwind('bg-gray-100')}
            style={tailwind('h-px')}
          />
        )
      }
      ListFooterComponent={
        <View style={tailwind('items-center py-6 px-4')}>
          <ThemedText style={tailwind('text-xs font-normal')}>
            {translate('screens/CommunityScreen', 'DeFiChain is a community-driven and open project.')}
          </ThemedText>

          <ThemedText style={tailwind('text-xs font-normal')}>
            {translate('screens/CommunityScreen', 'The DeFiChain Foundation does not provide direct support.')}
          </ThemedText>
        </View>
      }
      ListHeaderComponent={
        <ThemedSectionTitle
          testID='community_title'
          text={translate('screens/CommunityScreen', 'CONNECT WITH THE COMMUNITY:')}
        />
      }
      data={Communities}
      renderItem={({ item }) => (
        <CommunityItemRow
          key={item.id}
          {...item}
        />
      )}
      testID='community_flat_list'
    />
  )
}

interface CommunityItem {
  id: string
  title: string
  url: string
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
}

const Communities: CommunityItem[] = [
  { id: 'gh', title: 'Report an issue on Github', url: 'https://github.com/DeFiCh/wallet/issues', icon: 'github' },
  { id: 'faq', title: 'Frequently Asked Questions', url: 'https://defichain.com/learn/#faq', icon: 'help-circle' },
  { id: 'tg_en', title: 'Telegram (EN)', url: 'https://t.me/defiblockchain', icon: 'telegram' },
  { id: 'tg_de', title: 'Telegram (DE)', url: 'https://t.me/defiblockchain_DE', icon: 'telegram' },
  { id: 'announcements', title: 'Announcements', url: 'https://t.me/defichain_announcements', icon: 'telegram' },
  { id: 'wechat', title: 'WeChat', url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB', icon: 'wechat' },
  { id: 'reddit', title: 'Reddit Community', url: 'https://www.reddit.com/r/defiblockchain/', icon: 'reddit' },
  { id: 'website', title: 'Official Website', url: 'https://defichain.com/', icon: 'web' },
  { id: 'explorer', title: 'DeFiScan', url: 'https://defiscan.live/', icon: 'magnify' }
]

function CommunityItemRow ({ id, title, url, icon }: CommunityItem): JSX.Element {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])

  return (
    <ThemedTouchableOpacity
      onPress={handlePress}
      style={tailwind('flex-row p-4 items-center')}
      testID={id}
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialCommunityIcons'
        light={tailwind('text-primary-500')}
        name={icon}
        size={24}
      />

      <ThemedText style={tailwind('ml-2')}>
        {translate('screens/CommunityScreen', title)}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
