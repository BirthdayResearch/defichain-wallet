import React, { memo } from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { SymbolIcon } from './SymbolIcon'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetWithNavRouteParam } from './BottomSheetWithNav'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { AddOrRemoveCollateralResponse } from '@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'

interface BottomSheetTokenListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onTokenPress?: (token: BottomSheetToken) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: (item: AddOrRemoveCollateralResponse) => void
  }
  tokens: Array<CollateralItem | BottomSheetToken>
}

export interface BottomSheetToken {
  tokenId: string
  available: BigNumber
  token: {
    name: string
    displaySymbol: string
    symbol: string
  }
  factor?: string
  reserve?: string
}

export const BottomSheetTokenList = ({
  headerLabel,
  onCloseButtonPress,
  onTokenPress,
  navigateToScreen,
  tokens
}: BottomSheetTokenListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  return (
    <FlatList
      data={tokens}
      renderItem={({ item }: { item: CollateralItem | BottomSheetToken }): JSX.Element => (
        <ThemedTouchableOpacity
          disabled={new BigNumber(item.available).lte(0)}
          onPress={() => {
            if (onTokenPress !== undefined) {
              onTokenPress(item)
            }
            if (navigateToScreen !== undefined) {
              navigation.navigate({
                name: navigateToScreen.screenName,
                params: {
                  token: item.token,
                  available: item.available.toFixed(8),
                  onButtonPress: navigateToScreen.onButtonPress,
                  collateralFactor: new BigNumber(item.factor ?? 0).times(100),
                  isAdd: true
                },
                merge: true
              })
            }
          }}
          style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
          testID={`select_${item.token.displaySymbol}`}
        >
          <View style={tailwind('flex flex-row items-center')}>
            <SymbolIcon
              symbol={item.token.displaySymbol} styleProps={{
              width: 24,
              height: 24
            }}
            />
            <View style={tailwind('ml-2')}>
              <ThemedText>
                {item.token.displaySymbol}
              </ThemedText>
              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind(['text-xs', { hidden: item.token.name === '' }])}
              >
                {item.token.name}
              </ThemedText>
            </View>
          </View>
          <View style={tailwind('flex flex-row items-center')}>
            <NumberFormat
              value={item.available.toFixed(8)}
              thousandSeparator
              displayType='text'
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-700')}
                  dark={tailwind('text-gray-300')}
                  style={tailwind('mr-0.5')}
                  testID={`select_${item.token.displaySymbol}_value`}
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
          dark={tailwind('bg-gray-800 border-gray-700')}
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
      keyExtractor={(item) => item.tokenId}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
