import { View } from '@components'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedText,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { translate } from '@translations'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
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
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { LabeledAddress, setAddresses, setUserPreferences } from '@store/userPreferences'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { openURL } from '@api/linking'

interface BottomSheetAddressDetailProps {
  address: string
  addressLabel: string
  onReceiveButtonPress: () => void
  onTransactionsButtonPress: () => void
  onCloseButtonPress: () => void
  navigateToScreen: {
    screenName: string
  }
}

export const BottomSheetAddressDetailV2 = (props: BottomSheetAddressDetailProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
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
  const { getAddressUrl } = useDeFiScanContext()

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
      toast.show(translate('components/toaster', 'Copied'), {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION
      })
    } else {
      toast.hideAll()
    }
  }, [showToast, props.address])

  // Getting addresses
  // TODO: replace with useWalletAddress hook
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
      <ThemedTouchableOpacityV2
        style={tailwind('py-3 mx-12 mt-4 border-none items-center')}
        onPress={async () => {
          await onChangeAddress(addressLength + 1)
        }}
        testID='create_new_address'
      >
        <ThemedTextV2
          style={tailwind('text-base font-semibold-v2 text-center')}
        >
          {translate('components/BottomSheetAddressDetail', 'Create wallet address')}
        </ThemedTextV2>
        {/* <View style={tailwind('flex-row items-center flex-grow')}> */}
        {/*  <ThemedIcon */}
        {/*    size={20} */}
        {/*    name='add' */}
        {/*    dark={tailwind('text-darkprimary-500')} */}
        {/*    light={tailwind('text-primary-500')} */}
        {/*    style={tailwind('font-normal')} */}
        {/*    iconType='MaterialIcons' */}
        {/*  /> */}

        {/*  <View style={tailwind('mx-3 flex-auto')}> */}
        {/*    <ThemedText */}
        {/*      dark={tailwind('text-darkprimary-500')} */}
        {/*      light={tailwind('text-primary-500')} */}
        {/*      style={tailwind('text-sm font-normal')} */}
        {/*    > */}
        {/*      {translate('components/BottomSheetAddressDetail', 'CREATE WALLET ADDRESS')} */}
        {/*    </ThemedText> */}
        {/*  </View> */}
        {/* </View> */}
      </ThemedTouchableOpacityV2>
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
    const isSelected = item === props.address
    const hasLabel = labeledAddresses?.[item]?.label != null && labeledAddresses?.[item]?.label !== ''

    return (
      <ThemedTouchableOpacityV2
        key={item}
        style={tailwind('p-4 flex flex-row items-center justify-between border-none mx-5 rounded-lg-v2')}
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        onPress={async () => {
          if (isEditing) {
            navigation.navigate({
              name: props.navigateToScreen.screenName,
              params: {
                title: 'Edit address label',
                isAddressBook: false,
                address: item,
                addressLabel: labeledAddresses != null ? labeledAddresses[item] : '',
                index: index + 1,
                type: 'edit',
                onSaveButtonPress: (labelAddress: LabeledAddress) => {
                  const addresses = { ...labeledAddresses, ...labelAddress }
                  dispatch(setAddresses(addresses)).then(() => {
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
          <RandomAvatar name={item} size={36} />
          <View style={tailwind('ml-3 flex-auto')}>
            {hasLabel &&
              (
                <View style={tailwind('flex-row items-center')}>
                  <ThemedTextV2
                    style={tailwind('font-semibold-v2 text-sm max-w-3/4')}
                    testID={`list_address_label_${item}`}
                    numberOfLines={1}
                  >
                    {labeledAddresses[item]?.label}
                  </ThemedTextV2>
                  {isSelected && (
                    <ThemedIcon
                      iconType='MaterialIcons' name='check-circle' size={16}
                      light={tailwind('text-green-v2')} dark={tailwind('text-green-v2')}
                      style={tailwind('ml-1')}
                    />
                  )}
                </View>

              )}
            <View
              style={tailwind('flex-row items-center')}
            >
              {isSelected && !hasLabel && (
                <ThemedIcon
                  iconType='MaterialIcons' name='check-circle' size={16}
                  light={tailwind('text-green-v2')} dark={tailwind('text-green-v2')}
                  style={tailwind('mr-1')}
                />
              )}
              <ThemedTextV2
                style={tailwind('font-normal-v2 text-xs max-w-3/4')}
                dark={tailwind('text-mono-dark-v2-700')}
                light={tailwind('text-mono-light-v2-700')}
                ellipsizeMode='middle'
                numberOfLines={1}
                testID={`address_row_text_${index}`}
              >
                {item}
              </ThemedTextV2>
              {isSelected && (
                <ThemedTouchableOpacityV2
                  onPress={async () => await openURL(getAddressUrl(item))}
                  style={tailwind('border-none p-1')}
                >
                  <ThemedIcon
                    size={12}
                    name='external-link'
                    dark={tailwind('text-mono-dark-v2-700')}
                    light={tailwind('text-mono-light-v2-700')}
                    style={tailwind('font-normal')}
                    iconType='Feather'
                  />
                </ThemedTouchableOpacityV2>
              )}
            </View>
          </View>
          <ThemedTouchableOpacityV2
            style={tailwind('border-none')}
            onPress={async () => {
              navigation.navigate({
                name: props.navigateToScreen.screenName,
                params: {
                  title: 'Edit address label',
                  isAddressBook: false,
                  address: item,
                  addressLabel: labeledAddresses != null ? labeledAddresses[item] : '',
                  index: index + 1,
                  type: 'edit',
                  onSaveButtonPress: (labelAddress: LabeledAddress) => {
                    const addresses = { ...labeledAddresses, ...labelAddress }
                    dispatch(setAddresses(addresses)).then(() => {
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
            }}
          >
            <ThemedIcon
              size={16} iconType='Feather' name='edit-2' light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
            />
          </ThemedTouchableOpacityV2>
          {/* {isEditing */}
          {/*  ? ( */}
          {/*    <ThemedIcon */}
          {/*      size={24} */}
          {/*      name='edit' */}
          {/*      iconType='MaterialIcons' */}
          {/*      light={tailwind('text-primary-500')} */}
          {/*      dark={tailwind('text-darkprimary-500')} */}
          {/*      testID={`address_edit_indicator_${item}`} */}
          {/*    /> */}
          {/*  ) */}
          {/*  : item === props.address */}
          {/*    ? ( */}
          {/*      <ThemedIcon */}
          {/*        size={24} */}
          {/*        name='check' */}
          {/*        iconType='MaterialIcons' */}
          {/*        light={tailwind('text-success-600')} */}
          {/*        dark={tailwind('text-darksuccess-600')} */}
          {/*        testID={`address_active_indicator_${item}`} */}
          {/*      /> */}
          {/*    ) */}
          {/*    : ( */}
          {/*      <View style={tailwind('h-6 w-6')} /> */}
          {/*    )} */}
        </View>
      </ThemedTouchableOpacityV2>
    )
  }, [isEditing, labeledAddresses])

  const AddressDetail = useCallback(() => {
    return (
      <ThemedViewV2
        style={tailwind('flex flex-col w-full px-5 pb-2 items-center')}
      >
        <View style={tailwind('flex-row justify-end w-full m-5')}>
          <ThemedTouchableOpacityV2 style={tailwind('border-none')} onPress={props.onCloseButtonPress}>
            <ThemedIcon
              size={20}
              name='x-circle'
              iconType='Feather'
              dark={tailwind('text-mono-dark-v2-900')}
              light={tailwind('text-mono-light-v2-900')}
              testID='close_address_detail_button'
            />
          </ThemedTouchableOpacityV2>
        </View>
        <RandomAvatar name={props.address} size={64} />
        {
          activeLabel != null && (
            <View style={tailwind('mt-2')}>
              <ThemedText
                light={tailwind('text-mono-light-v2-900')}
                dark={tailwind('text-mono-dark-v2-900')}
                style={tailwind('font-semibold-v2 text-base text-center')}
                testID='list_header_address_label'
              >{activeLabel}
              </ThemedText>
            </View>
          )
        }
        <ActiveAddress address={props.address} onPress={onActiveAddressPress} />
        {/* <AddressDetailAction */}
        {/*  onReceivePress={props.onReceiveButtonPress} */}
        {/*  onTransactionsButtonPress={props.onTransactionsButtonPress} */}
        {/* /> */}
        <View style={tailwind('mt-12 px-5 flex flex-row items-center justify-between w-full')}>
          <WalletCounterDisplay addressLength={addressLength} />
          <DiscoverWalletAddress onPress={discoverWalletAddresses} />
          {/* <AddressListEditButton isEditing={isEditing} handleOnPress={() => setIsEditing(!isEditing)} /> */}
        </View>
      </ThemedViewV2>
    )
  }, [props, addressLength, isEditing, activeLabel])

  return (
    <FlatList
      keyExtractor={(item) => item}
      stickyHeaderIndices={[0]}
      style={tailwind({
        'bg-mono-dark-v2-100': !isLight,
        'bg-mono-light-v2-100': isLight
      })}
      data={availableAddresses}
      renderItem={AddressListItem}
      ListHeaderComponent={AddressDetail}
      ListFooterComponent={CreateAddress}
      contentContainerStyle={tailwind('pb-4')}
      ItemSeparatorComponent={() => {
        return (<View style={tailwind('h-2')} />)
      }}
    />
  )
})

function ActiveAddress ({
  address,
  onPress
}: { address: string, onPress: () => void }): JSX.Element {
  const { getAddressUrl } = useDeFiScanContext()
  return (
    <View style={tailwind('flex-row w-full mt-2 justify-center')}>
      <ThemedTouchableOpacityV2
        style={tailwind('border-none w-5/12')}
        onPress={onPress}
      >
        <ThemedTextV2
          ellipsizeMode='middle'
          style={tailwind('font-normal-v2 text-sm ')}
          numberOfLines={1}
          testID='active_address'
        >
          {address}
        </ThemedTextV2>
      </ThemedTouchableOpacityV2>
      <ThemedTouchableOpacityV2
        onPress={async () => await openURL(getAddressUrl(address))}
        style={tailwind('border-none p-1')}
      >
        <ThemedIcon
          size={12}
          name='external-link'
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
          style={tailwind('font-normal')}
          iconType='Feather'
        />
      </ThemedTouchableOpacityV2>
    </View>
  )
}

// function AddressDetailAction ({
//   onReceivePress,
//   onTransactionsButtonPress
// }: { onReceivePress: () => void, onTransactionsButtonPress: () => void }): JSX.Element {
//   return (
//     <View style={tailwind('flex flex-row justify-center')}>
//       <IconButton
//         iconLabel={translate('components/BottomSheetAddressDetail', 'RECEIVE')}
//         iconName='arrow-downward'
//         iconSize={18}
//         iconType='MaterialIcons'
//         style={tailwind('py-2 px-3 mr-1 w-5/12 flex-row justify-center')}
//         onPress={onReceivePress}
//         textStyle={tailwind('pt-0.5')}
//       />
//       <IconButton
//         iconLabel={translate('BottomTabNavigator', 'TRANSACTIONS')}
//         iconName='clock-outline'
//         iconSize={18}
//         iconType='MaterialCommunityIcons'
//         style={tailwind('py-2 px-3 ml-1 flex-row justify-center')}
//         onPress={onTransactionsButtonPress}
//         textStyle={tailwind('pt-0.5')}
//         testID='bottom_tab_transactions'
//       />
//     </View>
//   )
// }

function WalletCounterDisplay ({ addressLength }: { addressLength: number }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-mono-light-v2-500')}
      dark={tailwind('text-mono-dark-v2-500')}
      style={tailwind('font-normal-v2 text-xs mr-1.5')}
      testID='address_detail_address_count'
    >
      {/* {translate('components/BottomSheetAddressDetail', '{{length}} ADDRESS(ES)', { length: addressLength + 1 })} */}
      {translate('components/BottomSheetAddressDetail', 'ADDRESS(ES)')}
    </ThemedText>
  )
}

function DiscoverWalletAddress ({ onPress }: { onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      onPress={onPress}
      testID='discover_wallet_addresses'
      style={tailwind('flex-row items-center border-none')}
    >
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-800')}
        light={tailwind('text-mono-light-v2-800')}
        style={tailwind('font-normal-v2 text-xs pr-1')}
      >{translate('components/BottomSheetAddressDetail', 'Refresh')}
      </ThemedTextV2>
      <ThemedIcon
        light={tailwind('text-mono-light-v2-800')}
        dark={tailwind('text-mono-dark-v2-800')}
        iconType='Feather'
        name='refresh-ccw'
        size={12}
      />
    </ThemedTouchableOpacityV2>
  )
}