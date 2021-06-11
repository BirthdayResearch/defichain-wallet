import { useCallback } from 'react'
import * as React from 'react'
import { Linking, FlatList, Text, TouchableOpacity, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../translations'

export function HelpScreen (): JSX.Element {
  return (
    <View style={tailwind('items-start justify-start w-full')}>
      <Text style={tailwind('font-bold p-4 text-base')}>
        {translate('screens/LoadingScreen', 'Connect with the community')}
      </Text>
      <FlatList
        style={tailwind('w-full mb-4')}
        data={HelpOptions}
        renderItem={({ item }) => (
          <HelpItemRow key={item.id} id={item.id} title={item.title} url={item.url} />)}
      />
      <View style={tailwind('flex-1 items-center justify-center w-full pt-4')}>
        <Text style={tailwind('text-gray-500 text-xs')}>
          {translate('screens/LoadingScreen', 'DeFiChain is a community-driven and open project.')}
        </Text>
        <Text style={tailwind('text-gray-500 text-xs')}>
          {translate('screens/LoadingScreen', 'The DeFiChain Foundation does not provide direct support.')}
        </Text>
      </View>
    </View>
  )
}

const HelpOptions = [
  { id: 'wiki', title: 'Community Wiki', url: 'https://defichain-wiki.com/' },
  { id: 'gh', title: 'Report an issue to Github', url: 'https://github.com/DeFiCh/wallet/issues' },
  { id: 'faq', title: 'Frequently Asked Questions', url: 'https://defichain.com/learn/#faq' },
  { id: 'tg_en', title: 'Telegram (EN)', url: 'https://t.me/defiblockchain' },
  { id: 'tg_de', title: 'Telegram (DE)', url: 'https://t.me/defiblockchain_DE' },
  { id: 'wechat', title: 'WeChat', url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB' },
  { id: 'reddit', title: 'Reddit Community', url: 'https://www.reddit.com/r/defiblockchain/' },
  { id: 'website', title: 'Official Website', url: 'https://defichain.com/' }
]

interface HelpScreenItem {
  id: string
  title: string
  url: string
}

function HelpItemRow ({ url, title }: HelpScreenItem): JSX.Element {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])
  return (
    <TouchableOpacity style={tailwind('bg-white p-4 border-b border-gray-200')} onPress={handlePress}>
      <Text>{translate('screens/HelpScreen', title)}</Text>
    </TouchableOpacity>
  )
}
