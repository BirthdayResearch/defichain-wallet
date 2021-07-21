import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import { useCallback } from 'react'
import { FlatList, Linking, TouchableOpacity } from 'react-native'
import { Text, View } from '../../../../../components'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'

export function CommunityScreen (): JSX.Element {
  return (
    <FlatList
      style={tailwind('bg-gray-100')}
      data={Communities}
      ListHeaderComponent={
        <Text style={tailwind('font-medium pt-6 pb-4 px-4')}>
          {translate('screens/CommunityScreen', 'Connect with the community:')}
        </Text>
      }
      ListFooterComponent={
        <View style={tailwind('items-center py-6 px-4')}>
          <Text style={tailwind('text-gray-400 text-xs font-normal')}>
            {translate('screens/CommunityScreen', 'DeFiChain is a community-driven and open project.')}
          </Text>
          <Text style={tailwind('text-gray-400 text-xs font-normal')}>
            {translate('screens/CommunityScreen', 'The DeFiChain Foundation does not provide direct support.')}
          </Text>
        </View>
      }
      ItemSeparatorComponent={
        () => <View style={tailwind('h-px bg-gray-100')} />
      }
      renderItem={({ item }) => (
        <CommunityItemRow key={item.id} {...item} />
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
  { id: 'wechat', title: 'WeChat', url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB', icon: 'wechat' },
  { id: 'reddit', title: 'Reddit Community', url: 'https://www.reddit.com/r/defiblockchain/', icon: 'reddit' },
  { id: 'website', title: 'Official Website', url: 'https://defichain.com/', icon: 'web' }
]

function CommunityItemRow ({ id, title, url, icon }: CommunityItem): JSX.Element {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])

  return (
    <TouchableOpacity
      style={tailwind('flex-row bg-white p-4 items-center')}
      onPress={handlePress}
      testID={id}
    >
      <MaterialCommunityIcons name={icon} size={24} style={tailwind('text-primary')} />
      <Text style={tailwind('ml-2')}>
        {translate('screens/CommunityScreen', title)}
      </Text>
    </TouchableOpacity>
  )
}
