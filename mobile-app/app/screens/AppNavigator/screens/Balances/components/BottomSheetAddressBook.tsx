import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { translate } from '@translations'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { LabeledAddress, setAddressBook, setUserPreferences } from '@store/userPreferences'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

interface BottomSheetAddressBookProps {
  address: string
  onAddressSelect: (address: string) => void
  onCloseButtonPress: () => void
  navigateToScreen: {
    screenName: string
  }
}

export const BottomSheetAddressBook = (props: BottomSheetAddressBookProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const dispatch = useAppDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [isEditing, setIsEditing] = useState(false)
  const navigation = useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>()
  const { network } = useNetworkContext()
  const userPreferences = useSelector((state: RootState) => state.userPreferences)
  const addressBook = userPreferences.addressBook

  const addresses = useMemo((): string[] => {
    if (addressBook === undefined) {
      return []
    }

    return Object.keys(addressBook)
  }, [addressBook])

  const FooterComponent = useMemo(() => {
    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('py-4 pl-4 pr-2 border-b')}
        onPress={() => {
          navigation.navigate({
            name: props.navigateToScreen.screenName,
            params: {
              title: 'Add new address',
              isAddressBook: true,
              index: addresses.length + 1,
              onSaveButtonPress: (labelAddress: LabeledAddress) => {
                dispatch(setAddressBook(labelAddress)).then(() => {
                  const addresses = { ...addressBook, ...labelAddress }
                  dispatch(setUserPreferences({
                    network,
                    preferences: {
                      ...userPreferences,
                      addressBook: addresses
                    }
                  }))
                })
                navigation.goBack()
                setIsEditing(false)
              }
            },
            merge: true
          })
        }}
        testID='add_new_address'
      >
        <View style={tailwind('flex-row items-center flex-grow')}>
          <ThemedIcon
            size={20}
            name='add'
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('font-normal')}
            iconType='MaterialIcons'
          />

          <View style={tailwind('mx-3 flex-auto')}>
            <ThemedText
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('text-sm font-normal')}
            >
              {translate('components/BottomSheetAddressBook', 'ADD NEW ADDRESS')}
            </ThemedText>
          </View>
        </View>
      </ThemedTouchableOpacity>
    )
  }, [addresses, addressBook])

  const onChangeAddress = (address: string): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    props.onAddressSelect(address)
  }

  const HeaderComponent = useMemo(() => {
    return (
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('flex flex-col items-center px-4 pb-2 border-b')}
      >
        <View style={tailwind('flex-row justify-between w-full mb-3')}>
          <ThemedText
            style={tailwind('text-lg font-medium')}
            testID='address_book_title'
          >
            {translate('components/BottomSheetAddressBook', 'Address book')}
          </ThemedText>
          <TouchableOpacity onPress={props.onCloseButtonPress}>
            <ThemedIcon
              size={24}
              name='close'
              iconType='MaterialIcons'
              dark={tailwind('text-white text-opacity-70')}
              light={tailwind('text-gray-600')}
              testID='close_address_detail_button'
            />
          </TouchableOpacity>
        </View>
        <View style={tailwind('flex flex-row items-center justify-between w-full')}>
          <WalletCounterDisplay addressLength={addresses.length} />
        </View>
      </ThemedView>
    )
  }, [isEditing, addresses])

  const AddressListItem = useCallback(({
    item,
    index
  }: { item: string, index: number }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        key={item}
        style={tailwind('p-4 flex flex-row items-center justify-between')}
        onPress={async () => {
          onChangeAddress(item)
        }}
        testID={`address_row_${index}`}
        disabled={hasPendingJob || hasPendingBroadcastJob}
      >
        <View style={tailwind('flex flex-row items-center flex-grow', { 'flex-auto': Platform.OS === 'web' })}>
          <RandomAvatar name={item} size={32} />
          <View style={tailwind('mx-2 flex-auto')}>
            {addressBook?.[item]?.label != null && addressBook?.[item]?.label !== '' &&
              (
                <ThemedText style={tailwind('text-sm w-full font-medium')} testID={`address_row_label_${item}`}>
                  {addressBook[item]?.label}
                </ThemedText>
              )}
            <ThemedText
              style={tailwind('text-sm w-full')}
              ellipsizeMode='middle'
              numberOfLines={1}
              testID={`address_row_text_${index}`}
            >
              {item}
            </ThemedText>
          </View>
        </View>
      </ThemedTouchableOpacity>
    )
  }, [isEditing, addressBook])

  return (
    <FlatList
      contentContainerStyle={tailwind('pb-4')}
      keyExtractor={(item) => item}
      stickyHeaderIndices={[0]}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
      data={addresses}
      renderItem={AddressListItem}
      ListHeaderComponent={HeaderComponent}
      ListFooterComponent={FooterComponent}
    />
  )
})

function WalletCounterDisplay ({ addressLength }: { addressLength: number }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-400')}
      dark={tailwind('text-gray-500')}
      style={tailwind('text-xs mr-1.5')}
      testID='address_detail_address_count'
    >
      {translate('components/BottomSheetAddressBook', '{{length}} ADDRESS(ES)', { length: addressLength })}
    </ThemedText>
  )
}
