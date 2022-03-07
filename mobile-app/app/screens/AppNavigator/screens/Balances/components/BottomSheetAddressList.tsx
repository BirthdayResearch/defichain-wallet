import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { translate } from '@translations'
import React, { memo, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { /* MAX_ALLOWED_ADDRESSES, */ useWalletContext } from '@shared-contexts/WalletContext'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'

interface BottomSheetAddressListProps {
  onCloseButtonPress: () => void
}

export const BottomSheetAddressList = (props: BottomSheetAddressListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { address, addressLength, setIndex, wallet } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const logger = useLogger()
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])
  // const [canCreateAddress, setCanCreateAddress] = useState<boolean>(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

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
    // const next = addressLength + 1
    // const isUsable = await wallet.isUsable(next)
    // setCanCreateAddress(isUsable && MAX_ALLOWED_ADDRESSES > next)
  }

  const onRowPress = async (index: number): Promise<void> => {
    await setIndex(index)
    // onClose()
  }

  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  useEffect(() => {
    fetchAddresses().catch(logger.error)
  }, [wallet, addressLength])

  useEffect(() => {
    isNextAddressUsable().catch(logger.error)
  }, [blockCount])

  return (
    <FlatList
      data={availableAddresses}
      renderItem={({ availableAddress, index }: { availableAddress: string, index: number }): JSX.Element => {
        return (
          <AddressItemRow
            key={availableAddress}
            address={availableAddress}
            isActive={availableAddress === address}
            index={index}
            onPress={async () => {
              await onRowPress(index)
            }}
            disabled={hasPendingJob || hasPendingBroadcastJob}
          />
        )
      }}
      // renderItem={({availableAddress}: {availableAddress: string}) => {
      //   return (<></>)
      // }}
      keyExtractor={(address) => address}
    />
  )
})

interface AddressItemRowProps {
  address: string
  isActive: boolean
  index: number
  onPress: () => void
  disabled: boolean
}

function AddressItemRow ({ address, isActive, index, onPress, disabled }: AddressItemRowProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-900 border-gray-700')}
      style={tailwind('py-4 pl-4 pr-2 border-b')}
      testID={`address_row_${index}`}
      disabled={disabled}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <RandomAvatar name={address} size={20} />
        <View style={tailwind('ml-3 flex-auto')}>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-100')}
            style={tailwind('text-sm w-full font-normal')}
            numberOfLines={1}
            testID={`address_row_text_${index}`}
            ellipsizeMode='middle'
          >
            {address}
          </ThemedText>
        </View>
        {isActive && (
          <ThemedView
            light={tailwind('bg-blue-100')}
            dark={tailwind('bg-darkblue-100')}
            style={tailwind('ml-1')}
            testID={`address_active_indicator_${address}`}
          >
            <ThemedText
              light={tailwind('text-blue-500')}
              dark={tailwind('text-darkblue-500')}
              style={tailwind('text-xs px-1 font-medium')}
            >
              {translate('screens/AddressControlScreen', 'ACTIVE')}
            </ThemedText>
          </ThemedView>
        )}
        <View style={tailwind('ml-3 flex-row items-center')}>
          <ThemedIcon
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-100')}
            iconType='MaterialIcons'
            name='chevron-right'
            size={24}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
