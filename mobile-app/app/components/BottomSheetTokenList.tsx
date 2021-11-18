import React, { memo } from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { SymbolIcon } from './SymbolIcon'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetWithNavRouteParam } from './BottomSheetWithNav'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

interface BottomSheetTokenListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onTokenPress?: (token: BottomSheetToken) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: () => void
  }
}

export interface BottomSheetToken {
  id: string
  name: string
  available: BigNumber
  collateralFactor: BigNumber
}

export const BottomSheetTokenList = ({
  headerLabel,
  onCloseButtonPress,
  onTokenPress,
  navigateToScreen
}: BottomSheetTokenListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>()
  const tokenList: BottomSheetToken[] = [
    {
      id: 'DFI',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBTC',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dETH',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dLTC',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBCH',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBCH1',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBCH2',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBCH3',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    }
  ]

  return (
    <BottomSheetFlatList
      data={tokenList}
      renderItem={({ item }): JSX.Element => (
        <ThemedTouchableOpacity
          onPress={() => {
            if (onTokenPress !== undefined) {
              onTokenPress(item)
            }
            if (navigateToScreen !== undefined) {
              navigation.navigate({
                name: navigateToScreen.screenName,
                params: {
                  token: item.id,
                  available: item.available,
                  collateralFactor: item.collateralFactor,
                  onButtonPress: navigateToScreen.onButtonPress
                },
                merge: true
              })
            }
          }}
          style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
        >
          <View style={tailwind('flex flex-row items-center')}>
            <SymbolIcon symbol={item.id} styleProps={{ width: 24, height: 24 }} />
            <View style={tailwind('ml-2')}>
              <ThemedText>
                {item.id}
              </ThemedText>
              <ThemedText
                light={tailwind('text-dfxgray-500')}
                dark={tailwind('text-dfxgray-400')}
                style={tailwind('text-xs')}
              >
                {item.name}
              </ThemedText>
            </View>
          </View>
          <View style={tailwind('flex flex-row items-center')}>
            <NumberFormat
              value={item.available.toFixed(8)}
              displayType='text'
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-700')}
                  dark={tailwind('text-dfxgray-300')}
                  style={tailwind('mr-0.5')}
                >
                  {value}
                </ThemedText>}
            />
            <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} />
          </View>
        </ThemedTouchableOpacity>
      )}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })} // border top on android to handle 1px of horizontal transparent line when scroll past header
        >
          <ThemedText
            style={tailwind('text-lg font-medium')}
          >
            {headerLabel}
          </ThemedText>
          <TouchableOpacity onPress={onCloseButtonPress}>
            <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
          </TouchableOpacity>
        </ThemedView>
      }
      stickyHeaderIndices={[0]}
      keyExtractor={(item) => item.id}
      style={tailwind({ 'bg-dfxblue-800': !isLight, 'bg-white': isLight })}
    />
  )
})
