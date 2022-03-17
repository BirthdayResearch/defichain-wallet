import { View } from '@components'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { translate } from '@translations'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { IconButton } from '@components/IconButton'
import { useToast } from 'react-native-toast-notifications'
import { debounce } from 'lodash'
import * as Clipboard from 'expo-clipboard'

interface BottomSheetAddressDetailProps {
  address: string
  addressLabel: string
  onReceiveButtonPress: () => void
  onCloseButtonPress: () => void
}

export const BottomSheetAddressDetail = (props: BottomSheetAddressDetailProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const toast = useToast()
  const [showToast, setShowToast] = useState(false)
  const TOAST_DURATION = 2000

  const onActiveAddressPress = useCallback(debounce(() => {
    if (showToast) {
      return
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), TOAST_DURATION)
  }, 500), [showToast])

  useEffect(() => {
    if (showToast) {
      Clipboard.setString(props.address)
      toast.show('Copied', {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION
      })
    } else {
      toast.hideAll()
    }
  }, [showToast, props.address])

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
        <ActiveAddress address={props.address} onPress={onActiveAddressPress} />
        <AddressDetailAction address={props.address} onReceivePress={props.onReceiveButtonPress} />
      </View>
    </ThemedScrollView>
  )
})

function ActiveAddress ({ address, onPress }: { address: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      style={tailwind('my-4 rounded-2xl py-1 px-2')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      onPress={onPress}
    >
      <ThemedText
        style={tailwind('text-sm')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        selectable
      >
        {address}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}

function AddressDetailAction ({ address, onReceivePress }: { address: string, onReceivePress: () => void }): JSX.Element {
  const { getAddressUrl } = useDeFiScanContext()

  return (
    <View style={tailwind('flex flex-row')}>
      <IconButton
        iconLabel={translate('components/BottomSheetAddressDetail', 'RECEIVE')}
        iconName='arrow-downward'
        iconSize={18}
        iconType='MaterialIcons'
        style={tailwind('py-2 px-3 mr-1 w-6/12 flex-row justify-center')}
        onPress={onReceivePress}
      />
      <IconButton
        iconLabel={translate('components/BottomSheetAddressDetail', 'VIEW ON SCAN')}
        iconName='open-in-new'
        iconSize={18}
        iconType='MaterialIcons'
        style={tailwind('py-2 px-3 ml-1 w-6/12 flex-row justify-center')}
        onPress={async () => await openURL(getAddressUrl(address))}
      />
    </View>
  )
}
