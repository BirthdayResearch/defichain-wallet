import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { translate } from '@translations'
import { InfoTextLink } from '@components/InfoTextLink'
import { View } from 'react-native'

export function EmptyBidsScreen (): JSX.Element {
  return (
    <ThemedView
      style={tailwind('px-8 mt-8 pb-2 pt-32 text-center')}
      testID='empty_bid'
    >
      <ThemedIcon
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        iconType='MaterialCommunityIcons'
        name='circle-off-outline'
        size={44}
        style={tailwind('pb-2 text-center')}
      />

      <ThemedText testID='empty_bid_title' style={tailwind('text-2xl pb-1 font-semibold text-center')}>
        {translate('components/EmptyBidsScreen', 'No active bids')}
      </ThemedText>

      <ThemedText testID='empty_bid_subtitle' style={tailwind('text-sm px-8 pb-4 text-center opacity-60')}>
        {translate('components/EmptyBidsScreen', 'To get started, browse on auctions and place a bid')}
      </ThemedText>

      <View style={tailwind('flex items-center')}>
        <InfoTextLink
          onPress={() => {}}
          text='Learn more about auctions and bidding'
          testId='empty_bid_learn_more'
        />
      </View>
    </ThemedView>
  )
}
