import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { ActivityIndicator, Animated, Linking, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text } from '..'
import { PrimaryColor, PrimaryColorStyle } from '../../constants/Theme'
import { RootState } from '../../store'
import { networkDrawer } from '../../store/networkDrawer'
import { translate } from '../../translations'

async function handlePress (txid: string): Promise<void> {
  // TODO(thedoublejay) explorer URL
  const url = `https://explorer.defichain.io/#/DFI/mainnet/tx/${txid}`
  const supported = await Linking.canOpenURL(url)
  if (supported) {
    await Linking.openURL(url)
  }
}

/**
 * @description - Global component to be used for async calls, network errors etc. This component is positioned above the bottom tab.
 * Need to get the height of bottom tab via `useBottomTabBarHeight()` hook to be called on screen.
 * @example
 *          const height = useBottomTabBarHeight()
 *          // Accepts partial state
 *          dispatch(openNetworkDrawer({ isOpen: true, isLoading: true, height }))
 * */
export function NetworkDrawer (): JSX.Element {
  const { height, isLoading, txid, title, isOpen } = useSelector((state: RootState) => state.networkDrawer)
  const dispatch = useDispatch()

  const slideAnim = useRef(new Animated.Value(0)).current
  Animated.timing(slideAnim, { toValue: isOpen ? height : 0, duration: 300, useNativeDriver: false }).start()

  return (
    <Animated.View
      style={[tailwind('bg-white px-5 py-3 flex-row absolute w-full items-center border-t border-gray-200 z-10'), {
        bottom: slideAnim,
        height: 75
      }]}
    >
      {
        isLoading ? <ActivityIndicator color={PrimaryColor} />
          : <MaterialIcons name='check-circle' size={20} color='#02B31B' />
      }
      <View style={tailwind('flex-grow mr-1 justify-center items-center text-center')}>
        <Text style={tailwind('text-sm font-bold')}>{translate('screens/NetworkDrawer', title)}</Text>
        {
          txid !== undefined && (
            <TouchableOpacity
              testID='networkDrawer_explorer' style={tailwind('flex-row bg-white p-1 items-center')}
              onPress={async () => await handlePress(txid)}
            >
              <Text style={[PrimaryColorStyle.text, tailwind('text-sm font-medium mr-1')]}>
                {`${txid.substring(0, 15)}...`}
              </Text>
              <MaterialIcons name='open-in-new' size={18} color={PrimaryColor} />
            </TouchableOpacity>
          )
        }
      </View>
      {
        !isLoading && (
          <TouchableOpacity
            testID='networkDrawer_close' onPress={() => {
              dispatch(networkDrawer.actions.openNetworkDrawer({ isOpen: false }))
            }} style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
          >
            <Text style={[PrimaryColorStyle.text, tailwind('text-sm')]}>
              {translate('screens/NetworkDrawer', 'OK')}
            </Text>
          </TouchableOpacity>
        )
      }
    </Animated.View>
  )
}
