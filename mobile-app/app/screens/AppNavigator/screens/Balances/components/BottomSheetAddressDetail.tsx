import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { translate } from '@translations'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { IconButton } from '@components/IconButton'
import { useToast } from 'react-native-toast-notifications'
import { debounce } from 'lodash'
import * as Clipboard from 'expo-clipboard'
import { MAX_ALLOWED_ADDRESSES, useWalletContext } from '@shared-contexts/WalletContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { wallet as walletReducer } from '@store/wallet'
import { useSelector } from 'react-redux'
import { loans } from '@store/loans'
import { RootState, useAppDispatch } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { LabeledAddress, setAddresses, setUserPreferences } from '@store/userPreferences'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useAddressLabel } from '@hooks/useAddressLabel'

interface BottomSheetAddressDetailProps {
  address: string
  addressLabel: string
  onReceiveButtonPress: () => void
  onCloseButtonPress: () => void
  navigateToScreen: {
    screenName: string
    onButtonPress: (item: { address: string, addressLabel: string }) => void
  }
}

export const BottomSheetAddressDetail = (props: BottomSheetAddressDetailProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const {
    addressLength,
    setIndex,
    wallet,
    activeAddressIndex,
    discoverWalletAddresses
  } = useWalletContext()
  const toast = useToast()
  const [showToast, setShowToast] = useState(false)
  const TOAST_DURATION = 2000
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])
  const [canCreateAddress, setCanCreateAddress] = useState<boolean>(false)
  const logger = useLogger()
  const dispatch = useAppDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [isEditing, setIsEditing] = useState(false)
  const navigation = useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>()
  const { network } = useNetworkContext()
  const userPreferences = useSelector((state: RootState) => state.userPreferences)
  const labeledAddresses = userPreferences.addresses
  const activeLabel = useAddressLabel(props.address)

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

  // Getting addresses
  const fetchAddresses = async (): Promise<void> => {
    const addresses: string[] = []
    for (let i = 0; i <= addressLength; i++) {
      const account = wallet.get(i)
      const address = await account.getAddress()
      addresses.push(address)
    }
    setAvailableAddresses(addresses)
    await isNextAddressUsable()
  }

  const isNextAddressUsable = async (): Promise<void> => {
    // incremented 1 to check if next account in the wallet is usable.
    const next = addressLength + 1
    const isUsable = await wallet.isUsable(next)
    setCanCreateAddress(isUsable && MAX_ALLOWED_ADDRESSES > next)
  }

  useEffect(() => {
    fetchAddresses().catch(logger.error)
  }, [wallet, addressLength])

  useEffect(() => {
    isNextAddressUsable().catch(logger.error)
  }, [blockCount])

  const CreateAddress = useCallback(() => {
    if (!canCreateAddress || isEditing) {
      return <></>
    }

    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-100')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('py-4 pl-4 pr-2 border-b')}
        onPress={async () => {
          await onChangeAddress(addressLength + 1)
        }}
        testID='create_new_address'
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
              {translate('components/BottomSheetAddressDetail', 'CREATE WALLET ADDRESS')}
            </ThemedText>
          </View>
        </View>
      </ThemedTouchableOpacity>
    )
  }, [canCreateAddress, addressLength, isEditing])

  const onChangeAddress = async (index: number): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob || index === activeAddressIndex) {
      return
    }

    dispatch(walletReducer.actions.setHasFetchedToken(false))
    dispatch(loans.actions.setHasFetchedVaultsData(false))
    await setIndex(index)
    props.onCloseButtonPress()
  }

  const AddressListItem = useCallback(({
    item,
    index
  }: { item: string, index: number }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        key={item}
        style={tailwind('p-4 flex flex-row items-center justify-between')}
        onPress={async () => {
          if (isEditing) {
            navigation.navigate({
              name: props.navigateToScreen.screenName,
              params: {
                address: item,
                addressLabel: labeledAddresses != null ? labeledAddresses[item] : '',
                index: index + 1,
                type: 'edit',
                onSubmitButtonPress: (labelAddress: LabeledAddress) => {
                  dispatch(setAddresses(labelAddress)).then(() => {
                    const addresses = { ...labeledAddresses, ...labelAddress }
                    dispatch(setUserPreferences({
                      network,
                      preferences: {
                        ...userPreferences,
                        addresses
                      }
                    }))
                  })
                  navigation.goBack()
                  setIsEditing(false)
                }
              },
              merge: true
            })
          } else {
            await onChangeAddress(index)
          }
        }}
        testID={`address_row_${index}`}
        disabled={hasPendingJob || hasPendingBroadcastJob}
      >
        <View style={tailwind('flex flex-row items-center flex-grow', { 'flex-auto': Platform.OS === 'web' })}>
          <RandomAvatar name={item} size={32} />
          <View style={tailwind('mx-2 flex-auto')}>
            {labeledAddresses?.[item]?.label != null && labeledAddresses?.[item]?.label !== '' &&
              (
                <ThemedText style={tailwind('text-sm w-full font-medium')}>
                  {labeledAddresses[item]?.label}
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
          {isEditing
            ? (
              <ThemedIcon
                size={24}
                name='edit'
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
                testID={`address_edit_indicator_${item}`}
              />
            )
            : item === props.address
              ? (
                <ThemedIcon
                  size={24}
                  name='check'
                  iconType='MaterialIcons'
                  light={tailwind('text-success-600')}
                  dark={tailwind('text-darksuccess-600')}
                  testID={`address_active_indicator_${item}`}
                />
              )
              : (
                <View style={tailwind('h-6 w-6')} />
              )}
        </View>
      </ThemedTouchableOpacity>
    )
  }, [isEditing, labeledAddresses])

  const AddressDetail = useCallback(() => {
    return (
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('flex flex-col items-center px-4 pb-2 border-b')}
      >
        <View style={tailwind('flex-row justify-end w-full mb-3 relative -right-0.5')}>
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
        <RandomAvatar name={props.address} size={64} />
        {
          activeLabel != null && (
            <View style={tailwind('mt-2')}>
              <ThemedText
                light={tailwind('text-black')}
                dark={tailwind('text-white')} style={tailwind('font-bold')}
              >{activeLabel}
              </ThemedText>
            </View>
          )
        }
        <ActiveAddress address={props.address} onPress={onActiveAddressPress} />
        <AddressDetailAction address={props.address} onReceivePress={props.onReceiveButtonPress} />
        <View style={tailwind('mt-8 flex flex-row items-center justify-between w-full')}>
          <View style={tailwind('flex flex-row items-center justify-start')}>
            <WalletCounterDisplay addressLength={addressLength} />
            <DiscoverWalletAddress onPress={discoverWalletAddresses} />
          </View>
          <EditButton isEditing={isEditing} onPress={() => setIsEditing(!isEditing)} />
        </View>
      </ThemedView>
    )
  }, [props, addressLength, isEditing, activeLabel])

  return (
    <FlatList
      keyExtractor={(item) => item}
      stickyHeaderIndices={[0]}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
      data={availableAddresses}
      renderItem={AddressListItem}
      ListHeaderComponent={AddressDetail}
      ListFooterComponent={CreateAddress}
    />
  )
})

function ActiveAddress ({
  address,
  onPress
}: { address: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      style={tailwind('mb-4 mt-2 rounded-2xl py-1 px-2 w-5/12')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      onPress={onPress}
    >
      <ThemedText
        ellipsizeMode='middle'
        style={tailwind('text-sm')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        numberOfLines={1}
        testID='active_address'
      >
        {address}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}

function AddressDetailAction ({
  address,
  onReceivePress
}: { address: string, onReceivePress: () => void }): JSX.Element {
  const { getAddressUrl } = useDeFiScanContext()

  return (
    <View style={tailwind('flex flex-row justify-center')}>
      <IconButton
        iconLabel={translate('components/BottomSheetAddressDetail', 'RECEIVE')}
        iconName='arrow-downward'
        iconSize={18}
        iconType='MaterialIcons'
        style={tailwind('py-2 px-3 mr-1 w-5/12 flex-row justify-center')}
        onPress={onReceivePress}
      />
      <IconButton
        iconLabel={translate('components/BottomSheetAddressDetail', 'VIEW ON SCAN')}
        iconName='open-in-new'
        iconSize={18}
        iconType='MaterialIcons'
        style={tailwind('py-2 px-3 ml-1 w-5/12 flex-row justify-center')}
        onPress={async () => await openURL(getAddressUrl(address))}
      />
    </View>
  )
}

function WalletCounterDisplay ({ addressLength }: { addressLength: number }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-400')}
      dark={tailwind('text-gray-500')}
      style={tailwind('text-xs mr-1.5')}
      testID='address_detail_address_count'
    >
      {translate('components/BottomSheetAddressDetail', '{{length}} ADDRESS(ES)', { length: addressLength + 1 })}
    </ThemedText>
  )
}

function DiscoverWalletAddress ({ onPress }: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID='discover_wallet_addresses'
    >
      <ThemedIcon
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        name='sync'
        size={16}
      />
    </TouchableOpacity>
  )
}

function EditButton ({
  isEditing,
  onPress
}: { isEditing: boolean, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row items-center')}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        name={isEditing ? 'close' : 'drive-file-rename-outline'}
        size={16}
      />
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('text-2xs ml-1.5')}
      >
        {translate('components/BottomSheetAddressDetail', `${isEditing ? 'CANCEL' : 'EDIT'}`)}
      </ThemedText>
    </TouchableOpacity>

  )
}
