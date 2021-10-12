import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import { View } from 'react-native'
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
import { openURL } from '@api/linking'

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
      ListHeaderComponent={
        <ThemedSectionTitle
          testID='community_title'
          text={translate('screens/CommunityScreen', 'CONNECT WITH THE COMMUNITY')}
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
  {
    id: 'gh',
    title: 'Report an issue on Github',
    url: 'https://github.com/DeFiCh/wallet/issues',
    icon: 'github'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    url: 'https://defichain.com/learn/#faq',
    icon: 'help-circle'
  },
  {
    id: 'tg_en',
    title: 'Telegram (EN)',
    url: 'https://t.me/defiblockchain',
    icon: 'telegram'
  },
  {
    id: 'tg_de',
    title: 'Telegram (DE)',
    url: 'https://t.me/defiblockchain_DE',
    icon: 'telegram'
  },
  {
    id: 'announcements',
    title: 'Announcements',
    url: 'https://t.me/defichain_announcements',
    icon: 'telegram'
  },
  {
    id: 'wechat',
    title: 'WeChat',
    url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB',
    icon: 'wechat'
  }
]

function CommunityItemRow ({
  id,
  title,
  url,
  icon
}: CommunityItem): JSX.Element {
  const handlePress = async (): Promise<void> => {
    await openURL(url)
  }

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

      <ThemedText style={tailwind('ml-4 font-medium')}>
        {translate('screens/CommunityScreen', title)}
      </ThemedText>

      <View
        style={tailwind('flex flex-grow justify-end items-end')}
      >
        <ThemedIcon
          dark={tailwind('text-gray-200')}
          iconType='MaterialIcons'
          light={tailwind('text-gray-500')}
          name='chevron-right'
          size={24}
        />
      </View>
    </ThemedTouchableOpacity>
  )
}
