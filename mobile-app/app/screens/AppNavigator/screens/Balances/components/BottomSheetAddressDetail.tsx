import { View } from '@components'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { translate } from '@translations'
import React, { memo } from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { IconButton } from '@components/IconButton'

interface BottomSheetAddressDetailProps {
  address: string
  addressLabel: string
  onReceiveButtonPress: () => void
  onCloseButtonPress: () => void
}

export const BottomSheetAddressDetail = (props: BottomSheetAddressDetailProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  return (
    <ThemedScrollView
      style={tailwind('flex flex-col')}
      contentContainerStyle={tailwind('px-4 pb-4 items-center')}
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
    >
      <View style={tailwind('flex flex-col items-center')}>
        <View style={tailwind('flex-row justify-end w-full mb-3')}>
          <TouchableOpacity onPress={props.onCloseButtonPress}>
            <ThemedIcon
              size={24}
              name='close'
              iconType='MaterialIcons'
              dark={tailwind('text-white text-opacity-70')}
              light={tailwind('text-gray-600')}
            />
          </TouchableOpacity>
        </View>
        <RandomAvatar name={props.address} size={64} />
        <DefiscanButton address={props.address} />
        <IconButton
          iconLabel={translate('components/BottomSheetAddressDetail', 'RECEIVE IN WALLET')}
          iconName='arrow-downward'
          iconSize={18}
          iconType='MaterialIcons'
          style={tailwind('p-2')}
          onPress={props.onReceiveButtonPress}
        />
      </View>
    </ThemedScrollView>
  )
})

function DefiscanButton ({ address }: { address: string }): JSX.Element {
  const { getAddressUrl } = useDeFiScanContext()

  return (
    <ThemedView
      style={tailwind('mt-4 rounded-2xl py-1 pl-4 pr-3 flex flex-row items-center mb-2')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
    >
      <ThemedText
        style={tailwind('font-medium text-sm')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        selectable
      >
        {address}
      </ThemedText>
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='open-in-new'
        size={18}
        style={tailwind('ml-2')}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        onPress={async () => await openURL(getAddressUrl(address))}
      />
    </ThemedView>
  )
}
