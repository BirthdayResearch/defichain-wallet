import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView, ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { NavigationProp, useNavigation } from '@react-navigation/core'
import { BalanceParamList } from '../BalancesNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

export function AddressControlScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  return (
    <ThemedScrollView>
      <ThemedSectionTitle
        testID='onboarding_network_selection_screen_title'
        text={translate('screens/OnboardingNetworkSelectScreen', 'Switch to another wallet')}
      />
      <AddressControlCard onClose={() => navigation.goBack()} />
    </ThemedScrollView>
  )
}

export function AddressControlModal ({ onClose }: { onClose?: () => void }): JSX.Element {
  return (
    <View style={tailwind('w-full pb-16')}>
      <ThemedView
        dark={tailwind('border-b-2 border-gray-700')}
        light={tailwind('border-b-2 border-gray-100')}
        style={tailwind('w-full')}
      >
        <View style={tailwind('flex flex-row justify-between w-full px-4 pb-4 pt-2')}>
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('ml-2 text-lg font-medium')}
          >
            {translate('screens/AddressControlScreen', 'Switch to another wallet')}
          </ThemedText>
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

export function AddressControlCard ({ onClose }: { onClose?: () => void }): JSX.Element {
  const { availableAddresses, switchAccount, createAddress, wallet } = useWalletContext()
  const [canCreateAddress, setCanCreateAddress] = useState<boolean>(false)
  const logger = useLogger()

  useEffect(() => {
    wallet.discover(availableAddresses.length).then(discoveredAddress => {
      if (availableAddresses.length === discoveredAddress.length) {
        return setCanCreateAddress(true)
      }
      return setCanCreateAddress(false)
    }).catch(logger.error)
  }, [wallet, availableAddresses])

  return (
    <>
      {availableAddresses.map((availableAddress, index) =>
        <AddressItemRow
          key={availableAddress}
          address={availableAddress}
          onPress={async () => {
              await switchAccount(index)
              if (onClose != null) {
                onClose()
              }
            }}
        />
      )}
      {canCreateAddress && (
        <ThemedTouchableOpacity
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-white border-b border-gray-100')}
          style={tailwind('py-4 pl-4 pr-2')}
          onPress={createAddress}
          testID='create_new_address'
        >
          <View style={tailwind('flex-row items-center flex-grow')}>
            <ThemedIcon
              size={16}
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

function AddressItemRow ({ address, onPress }: { address: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-100')}
      onPress={onPress}
      style={tailwind('py-4 pl-4 pr-2')}
      testID={`address_row_${address}`}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <ThemedIcon
          size={16}
          name='account-balance-wallet'
          iconType='MaterialIcons'
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
        />

        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('text-sm w-full font-normal')}
            // style={tailwind('font-semibold w-44 flex-shrink')}
            numberOfLines={1}
            ellipsizeMode='middle'
          >
            {address}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <ThemedIcon
            dark={tailwind('text-gray-200')}
            iconType='MaterialIcons'
            light={tailwind('text-black')}
            name='chevron-right'
            size={24}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
