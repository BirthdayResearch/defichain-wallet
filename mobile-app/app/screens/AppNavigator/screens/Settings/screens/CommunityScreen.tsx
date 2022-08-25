import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { openURL } from '@api/linking'
import { View } from 'react-native'

export function CommunityScreen (): JSX.Element {
  return (
    <ThemedFlatList
      ItemSeparatorComponent={
        () => (
          <ThemedViewV2
            dark={tailwind('bg-dfxblue-900')}
            light={tailwind('bg-gray-100')}
            style={tailwind('h-px')}
          />
        )
      }
      ListHeaderComponent={
        <ThemedSectionTitleV2
          testID='community_title'
          text={translate('screens/CommunityScreen', 'JOIN THE COMMUNITY')}
        />
      }
      data={Communities}
      renderItem={({
        item,
        index
      }) => (
        <CommunityItemRow
          key={item.id}
          item={item}
          first={index === 0}
          last={index === Communities.length - 1}
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
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] | React.ComponentProps<typeof FontAwesome>['name']
}

const Communities: CommunityItem[] = [
  { id: 'gh', title: 'Report an issue on Github', url: 'https://github.com/DFXswiss/wallet/issues', icon: 'github' },
  { id: 'faq', title: 'Frequently Asked Questions', url: 'https://defichain-wiki.com/wiki/DFX_FAQ', icon: 'help-circle' },
  { id: 'announcements', title: 'Announcements', url: 'https://t.me/DFXinfo', icon: 'telegram' },
  { id: 'tg_en', title: 'Telegram (EN)', url: 'https://t.me/DFXswiss_en', icon: 'telegram' },
  { id: 'tg_de', title: 'Telegram (DE)', url: 'https://t.me/DFXswiss', icon: 'telegram' },
  { id: 'tg_it', title: 'Telegram (IT)', url: 'https://t.me/DFXswiss_it', icon: 'telegram' },
  { id: 'tg_fr', title: 'Telegram (FR)', url: 'https://t.me/DFXswiss_fr', icon: 'telegram' },
  { id: 'tg_ru', title: 'Telegram (RU)', url: 'https://t.me/DFXswiss_ru', icon: 'telegram' },
  { id: 'tg_es', title: 'Telegram (ES)', url: 'https://t.me/DFXswiss_es', icon: 'telegram' },
  { id: 'tg_pt', title: 'Telegram (PT)', url: 'https://t.me/DFXswiss_pt', icon: 'telegram' }
]

function CommunityItemRow ({
  item
  // first,
  // last
}: { item: CommunityItem, first: boolean, last: boolean }): JSX.Element {
  const handlePress = async (): Promise<void> => {
    await openURL(item.url)
  }

  return (
    <ThemedTouchableOpacityV2
      onPress={handlePress}
      style={tailwind('flex-row p-4 items-center')}
      testID={item.id}
    >
      <ThemedIcon
        dark={tailwind('text-dfxred-500')}
        iconType='MaterialCommunityIcons'
        light={tailwind('text-primary-500')}
        name={item.icon}
        size={24}
      />

      <ThemedTextV2 style={tailwind('ml-4 font-medium')}>
        {translate('screens/CommunityScreen', item.title)}
      </ThemedTextV2>

      <View
        style={tailwind('flex flex-grow justify-end items-end')}
      >
        <ThemedIcon
          dark={tailwind('text-gray-200')}
          iconType='MaterialIcons'
          light={tailwind('text-dfxgray-500')}
          name='chevron-right'
          size={24}
        />
      </View>
    </ThemedTouchableOpacityV2>
  )
}
