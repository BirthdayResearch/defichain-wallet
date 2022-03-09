import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView, ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { useEffect, useState, useLayoutEffect } from 'react'
import { MAX_ALLOWED_ADDRESSES, useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '../BalancesNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { RandomAvatar } from '@screens/AppNavigator/screens/Balances/components/RandomAvatar'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { wallet as walletReducer } from '@store/wallet'
import { loans } from '@store/loans'

export function AddressControlScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => (
        <DiscoverWalletAddress />
      )
    })
  }, [navigation])

  return (
    <ThemedScrollView>
      <ThemedSectionTitle
        testID='switch_address_screen_title'
        text={translate('screens/AddressControlScreen', 'Switch to another address')}
      />
      <AddressControlCard onClose={() => navigation.goBack()} />
    </ThemedScrollView>
  )
}

export function AddressControlModal ({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <View style={tailwind('w-full pb-16')}>
      <ThemedView
        dark={tailwind('border-gray-700')}
        light={tailwind('border-gray-100')}
        style={tailwind('border-b-2')}
      >
        <View style={tailwind('flex flex-row justify-between w-full px-4 pb-4 pt-2')}>
          <View style={tailwind('flex flex-row justify-between items-center')}>
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('ml-2 text-lg font-medium mr-2')}
            >
              {translate('screens/AddressControlScreen', 'Switch to another address')}
            </ThemedText>
            <DiscoverWalletAddress size={18} />
          </View>
          <TouchableOpacity onPress={onClose}>
            <ThemedIcon
              size={24}
              name='close'
              iconType='MaterialIcons'
              dark={tailwind('text-white text-opacity-70')}
              light={tailwind('text-gray-600')}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ThemedScrollView
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        contentContainerStyle={tailwind('pb-8')}
      >
        <AddressControlCard onClose={onClose} />
      </ThemedScrollView>
    </View>
  )
}

export function AddressControlCard ({ onClose }: { onClose: () => void }): JSX.Element {
  const { address, addressLength, setIndex, wallet } = useWalletContext()
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])
  const [canCreateAddress, setCanCreateAddress] = useState<boolean>(false)
  const blockCount = useSelector((state: RootState) => state.block.count)
  const dispatch = useDispatch()
  const logger = useLogger()

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

  const onRowPress = async (index: number): Promise<void> => {
    dispatch(walletReducer.actions.setHasFetchedToken(false))
    dispatch(loans.actions.setHasFetchedVaultsData(false))
    await setIndex(index)
    onClose()
  }

  useEffect(() => {
    fetchAddresses().catch(logger.error)
  }, [wallet, addressLength])

  useEffect(() => {
    isNextAddressUsable().catch(logger.error)
  }, [blockCount])

  if (address.length === 0) {
    return (
      <SkeletonLoader
        row={addressLength}
        screen={SkeletonLoaderScreen.Address}
      />
    )
  }

  return (
    <>
      {availableAddresses.map((availableAddress: string, index: number) =>
        <AddressItemRow
          key={availableAddress}
          address={availableAddress}
          isActive={address === availableAddress}
          index={index}
          onPress={async () => {
            await onRowPress(index)
          }}
        />
      )}
      {canCreateAddress && (
        <ThemedTouchableOpacity
          light={tailwind('bg-white border-gray-100')}
          dark={tailwind('bg-gray-900 border-gray-700')}
          style={tailwind('py-4 pl-4 pr-2 border-b ')}
          onPress={async () => {
            await onRowPress(addressLength + 1)
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
                {translate('screens/AddressControlScreen', 'CREATE WALLET ADDRESS')}
              </ThemedText>
            </View>
          </View>
        </ThemedTouchableOpacity>
      )}
    </>
  )
}

export function AddressItemRow ({ address, isActive, index, onPress }: { address: string, isActive: boolean, index: number, onPress: () => void }): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-900 border-gray-700')}
      style={tailwind('py-4 pl-4 pr-2 border-b')}
      testID={`address_row_${index}`}
      disabled={hasPendingJob || hasPendingBroadcastJob}
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

export function DiscoverWalletAddress ({ size = 24 }: { size?: number }): JSX.Element {
  const { discoverWalletAddresses } = useWalletContext()
  return (
    <TouchableOpacity
      onPress={discoverWalletAddresses}
      testID='discover_wallet_addresses'
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='sync'
        size={size}
      />
    </TouchableOpacity>
  )
}
