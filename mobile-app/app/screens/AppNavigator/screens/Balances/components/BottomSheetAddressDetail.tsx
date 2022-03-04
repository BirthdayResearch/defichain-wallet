import { View } from '@components'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { translate } from '@translations'
import React, { memo } from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'

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
      <ChangeAddressButton addressLabel={props.addressLabel} />
      <ThemedText
        style={tailwind('text-sm mb-6')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
      >
        {props.address}
      </ThemedText>
      <ReceiveButton onPress={props.onReceiveButtonPress} />
      <DefiscanButton address={props.address} />
    </ThemedScrollView>
  )
})

function ChangeAddressButton ({ addressLabel }: { addressLabel: string }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      style={tailwind('mt-2 rounded-lg py-1 pl-2 pr-1 flex flex-row items-center mb-2')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
    >
      <ThemedText
        style={tailwind('font-medium')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
      >
        {addressLabel}
      </ThemedText>
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='chevron-down'
        size={18}
        style={tailwind('ml-2')}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      />
    </ThemedTouchableOpacity>
  )
}
function ReceiveButton ({ onPress }: { onPress: () => void }): JSX.Element {
  return (
    <Button
      onPress={onPress}
      margin='mb-2'
    >
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedIcon
          iconType='MaterialIcons'
          name='arrow-downward'
          size={22}
          style={tailwind('mr-1 mt-0.5')}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-white')}
        />
        <ThemedText
          style={tailwind('text-sm font-medium')}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-white')}
        >
          {translate('components/BottomSheetAddressDetail', 'RECEIVE IN WALLET')}
        </ThemedText>
      </View>
    </Button>
  )
}

function DefiscanButton ({ address }: { address: string }): JSX.Element {
  const { getAddressUrl } = useDeFiScanContext()
  return (
    <TouchableOpacity
      style={tailwind('flex flex-row p-2')}
      onPress={async () => await openURL(getAddressUrl(address))}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='open-in-new'
        size={18}
        style={tailwind('mr-1 pt-0.5')}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      />
      <ThemedText
        style={tailwind('font-medium text-sm')}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      >
        {translate('components/BottomSheetAddressDetail', 'VIEW IN DEFISCAN')}
      </ThemedText>

    </TouchableOpacity>
  )
}
