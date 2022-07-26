import { memo, useCallback } from 'react'
import {
  ThemedIcon,
  ThemedText,
  ThemedViewV2,
  ThemedTouchableOpacityV2,
  ThemedTextV2
} from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Platform } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedFlatListV2 } from '@components/themed/ThemedFlatListV2'

export interface BottomSheetAssetSortProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onButtonPress: (item: PortfolioSortType) => void
  modifiedDenominationCurrency: string
  selectedAssetSortType: PortfolioSortType
}

export enum PortfolioSortType {
  HighestDenominationValue = 'Highest denomination value',
  LowestDenominationValue = 'Lowest denomination value',
  HighestTokenAmount = 'Highest token amount',
  LowestTokenAmount = 'Lowest token amount',
  AtoZ = 'A to Z',
  ZtoA = 'Z to A'
}

export const BottomSheetAssetSortList = ({
  headerLabel,
  onCloseButtonPress,
  onButtonPress,
  modifiedDenominationCurrency,
  selectedAssetSortType
}: BottomSheetAssetSortProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatListV2
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const assetSortList: PortfolioSortType[] = Object.values(PortfolioSortType)
  const highestCurrencyValue = translate('screens/PortfolioScreen', 'Highest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency })
  const lowestCurrencyValue = translate('screens/PortfolioScreen', 'Lowest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency })
  const getDisplayedSortText = useCallback((text: PortfolioSortType): string => {
    if (text === PortfolioSortType.HighestDenominationValue) {
      return highestCurrencyValue
    } else if (text === PortfolioSortType.LowestDenominationValue) {
      return lowestCurrencyValue
    }
    return text
  }, [modifiedDenominationCurrency])

  const renderItem = ({
    item,
    index
  }: {
    item: PortfolioSortType
    index: number
  }): JSX.Element => {
    return (
      <ThemedTouchableOpacityV2
        dark={tailwind('border-mono-dark-v2-300')}
        light={tailwind('border-mono-light-v2-300')}
        style={tailwind('px-5 py-3 flex-row  items-center justify-between border-b-0.5 py-2.5', { 'border-t-0.5': index === 0 })}
        testID={`select_asset_${getDisplayedSortText(item)}`}
        key={index}
        onPress={() => {
          onButtonPress(item)
        }}
      >
        <ThemedTextV2
          style={tailwind('py-2 text-sm')}
        >
          {translate('screens/PortfolioScreen', getDisplayedSortText(item))}
        </ThemedTextV2>
        {selectedAssetSortType === item && (
          <ThemedIcon
            size={18}
            name='check-circle'
            iconType='MaterialIcons'
            light={tailwind('text-green-v2')}
            dark={tailwind('text-green-v2')}
          />)}
      </ThemedTouchableOpacityV2>
    )
  }

  const headerComponent = (): JSX.Element => {
    return (
      <ThemedViewV2
        style={tailwind('flex flex-col px-5 pt-3 pb-5 mt-2.5 rounded-t-xl-v2 ', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })} // border top on android to handle 1px of horizontal transparent line when scroll past header
      >
        <ThemedTouchableOpacityV2
          onPress={onCloseButtonPress}
          style={tailwind('self-end')}
        >
          <ThemedIcon
            dark={tailwind('text-mono-dark-v2-900')}
            light={tailwind('text-mono-light-v2-900')}
            iconType='Feather'
            name='x-circle'
            size={20}
          />
        </ThemedTouchableOpacityV2>
        <ThemedText
          style={tailwind('text-xl font-normal-v2')}
        >
          {translate('screens/PortfolioScreen', headerLabel)}
        </ThemedText>

      </ThemedViewV2>
    )
  }

  return (
    <FlatList
      keyExtractor={(item) => item}
      data={assetSortList}
      renderItem={renderItem}
      ListHeaderComponent={headerComponent}
    />
  )
})
