// TEMPORARY: THIS WILL BE REMOVED ON THIS PR. Temporary for the composite swap to be testable
import React, { memo } from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { SymbolIcon } from '@components/SymbolIcon'

interface BottomSheetTokenListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onTokenPress?: (token: BottomSheetToken) => void
  tokensList: BottomSheetToken[]
}

export interface BottomSheetToken {
  id: string
  name: string
  available: BigNumber
  collateralFactor?: BigNumber
}

export const BottomSheetTokenList = ({
  tokensList,
  headerLabel,
  onTokenPress,
  onCloseButtonPress
}: BottomSheetTokenListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  return (
    <BottomSheetFlatList
      data={tokensList}
      renderItem={({ item }: { item: BottomSheetToken }): JSX.Element => (
        <ThemedTouchableOpacity
          disabled={new BigNumber(item.available).lte(0)}
          onPress={() => {
            if (onTokenPress !== undefined) {
              onTokenPress(item)
            }
          }}
          style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
        >
          <View style={tailwind('flex flex-row items-center')}>
            <SymbolIcon
              symbol={item.name} styleProps={{
              width: 24,
              height: 24
            }}
            />
            <View style={tailwind('ml-2')}>
              <ThemedText>
                {item.name}
              </ThemedText>
              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
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
                  dark={tailwind('text-gray-300')}
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
      keyExtractor={(item) => item.id}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
