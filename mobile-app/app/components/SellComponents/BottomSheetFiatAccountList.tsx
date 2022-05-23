import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '../themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { isValidIBAN } from 'ibantools'
import { SellRoute } from '@shared-api/dfx/models/SellRoute'

interface BottomSheetFiatAccountListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onFiatAccountPress?: (sellRoute: SellRoute) => void
  fiatAccounts: SellRoute[]
}

function checkIban (iban: string): boolean {
  // remove whitespaces
  iban = iban.replace(/\s/g, '')
  return isValidIBAN(iban)
}

export const BottomSheetFiatAccountList = ({
  headerLabel,
  onCloseButtonPress,
  onFiatAccountPress,
  fiatAccounts
}: BottomSheetFiatAccountListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  return (
    <FlatList
      data={fiatAccounts}
      renderItem={({ item }: { item: SellRoute }): JSX.Element => {
        return (
          <ThemedTouchableOpacity
            disabled={!checkIban(item.iban)}
            onPress={() => {
              if (onFiatAccountPress !== undefined) {
                onFiatAccountPress(item)
              }
            }}
            style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
            testID={`select_${item.iban}`}
          >
            <View style={tailwind('flex flex-row items-center')}>
              <View style={tailwind('ml-2')}>
                <ThemedText
                  testID={`token_symbol_${item.iban}`}
                >
                  {checkIban(item.iban) ? item.iban : '- Invalid IBAN -'}{/* // TODO @ThaBrad */}
                </ThemedText>
                <ThemedText
                  light={tailwind('text-dfxgray-500')}
                  dark={tailwind('text-dfxgray-400')}
                  style={tailwind(['text-xs', { hidden: item.id === '' }])}
                >
                  {item.id}
                </ThemedText>
              </View>
            </View>
            <View style={tailwind('flex flex-row items-center')}>
              <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} />
            </View>
          </ThemedTouchableOpacity>
        )
      }}
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
      keyExtractor={(item) => item.iban}
      style={tailwind({
        'bg-dfxblue-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
