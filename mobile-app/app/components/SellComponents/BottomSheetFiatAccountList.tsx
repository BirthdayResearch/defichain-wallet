import { memo, useState } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '../themed'
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { SellRoute } from '@shared-api/dfx/models/SellRoute'
import { ActionButton } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/ActionSection'
import { translate } from '@translations'
import { BottomSheetFiatAccountCreate } from './BottomSheetFiatAccountCreate'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'

interface BottomSheetFiatAccountListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onFiatAccountPress?: (sellRoute: SellRoute) => void
  fiatAccounts: SellRoute[]
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

  // Bottom sheet
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const containerRef = React.useRef(null)
  const bottomSheetRef = React.useRef<BottomSheetModal>(null)
  const expandModal = React.useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = React.useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [])

  const setFiatAccountCreateBottomSheet = React.useCallback((accounts: SellRoute[]) => { // TODO: remove accounts?
    setBottomSheetScreen([
      {
        stackScreenName: 'FiatAccountCreate',
        component: BottomSheetFiatAccountCreate({
          fiatAccounts: accounts,
          headerLabel: translate('screens/SellScreen', 'Add account'),
          onCloseButtonPress: () => dismissModal(),
          onElementCreatePress: async (item): Promise<void> => {
            if (item.iban !== undefined) {
              fiatAccounts.push(item)
            }
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
  }, [fiatAccounts])

  const filterEnabled = (sellRouteList: SellRoute[]): SellRoute[] => {
    return sellRouteList?.filter((item) => {
      return item.active
    })
  }

  const filteredList = filterEnabled(fiatAccounts)

  return (
    <>
      <FlatList
        data={filteredList}
        renderItem={({ item }: { item: SellRoute }): JSX.Element => {
          return (
            <ThemedTouchableOpacity
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
                    {`${item.fiat.name} / ${item.iban}`}
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
        keyExtractor={(item) => item.id}
        style={tailwind({
          'bg-dfxblue-800': !isLight,
          'bg-white': isLight
        })}
      />
      <View style={tailwind('flex flex-row')}>
        <View style={tailwind('flex  w-12')} />
        <ActionButton
          name='add'
          onPress={() => {
            setFiatAccountCreateBottomSheet(fiatAccounts)
            expandModal()
          }}
          pair={' '}
          label={translate('screens/SellScreen', 'IBAN')}
          style={tailwind('flex flex-grow mb-6 mt-2 h-8 justify-center')}
          testID='pool_pair_add_{symbol}'
          standalone
        />
        <View style={tailwind('flex w-12')} />

        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
            modalStyle={{
              position: 'absolute',
              height: '350px',
              width: '375px',
              zIndex: 50,
              bottom: '0'
            }}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
          />
        )}
      </View>
    </>
  )
})
