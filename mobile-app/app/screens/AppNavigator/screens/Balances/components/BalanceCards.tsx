import { ThemedFlatList } from '@components/themed'
import { View } from '@components'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '@translations'
import { useState } from 'react'
import tailwind from 'tailwind-rn'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { BalanceParamList } from '../BalancesNavigator'
import { BalanceRowToken } from '../BalancesScreen'

import { RootState } from '@store'
import { useSelector } from 'react-redux'

export enum ButtonGroupTabKey {
    AllTokens = 'ALL_TOKENS',
    LPTokens = 'LP_TOKENS',
    Crypto = 'CRYPTO',
    dAssets = 'd_ASSETS'
}

interface BalanceCardProps {
    // passed props into BalanceList from Balance screen
    dstTokens: BalanceRowToken[]
    navigation: StackNavigationProp<BalanceParamList>
    // required props for tabs - need to pass props from balance screen too
    type: 'all' | 'lp' | 'crypto' | 'dassets'
    buttonGroupOptions?: {
        onButtonGroupPress: (key: ButtonGroupTabKey) => void
        activeButtonGroup: string
        setActiveButtonGroup: (key: ButtonGroupTabKey) => void
    }
}

export function BalanceCards ({
  // passed props into BalanceList from Balance screen
    dstTokens,
    navigation,
    // required props for tabs - need to pass props from balance screen too
    type,
    buttonGroupOptions
}: BalanceCardProps): JSX.Element {
    const [expandedCardIds, setExpandedCardIds] = useState<string[]>([])
    console.log('expandedCardIds', expandedCardIds)
    const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet)) // for loading skeleton loader

    const buttonGroup = [
        {
            id: ButtonGroupTabKey.AllTokens,
            label: translate('screens/BalancesScreen', 'All tokens'),
            handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
        },
        {
            id: ButtonGroupTabKey.LPTokens,
            label: translate('screens/BalancesScreen', 'LP tokens'),
            handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
        },
        {
            id: ButtonGroupTabKey.Crypto,
            label: translate('screens/BalancesScreen', 'Crypto'),
            handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
        },
        {
            id: ButtonGroupTabKey.dAssets,
            label: translate('screens/BalancesScreen', 'dAssets'),
            handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
        }
    ]
    const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
        if (buttonGroupOptions !== undefined) {
            setExpandedCardIds([])
            buttonGroupOptions.setActiveButtonGroup(buttonGroupTabKey)
            buttonGroupOptions.onButtonGroupPress(buttonGroupTabKey)
        }
    }

    // to display selected list of card items in GroupTabKey
    const renderItem = ({
        item,
        index
    }: {
        item: any
        index: number
    }): JSX.Element => {
      // if not loaded yet then return skeleton loader
      if (!hasFetchedToken) {
        return (
          <View style={tailwind('px-4 py-1.5 -mb-3')}>
            <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Balance} />
          </View>
        )
      }
      return <></>
    }

    return (
      <>
        <ThemedFlatList
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-900')}
          contentContainerStyle={tailwind('p-4 ')}
          data={undefined}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              {
                  buttonGroupOptions !== undefined &&
                    <View style={tailwind('pb-2 pt-2 text-xs text-center')}>
                      <ButtonGroup
                        buttons={buttonGroup}
                        activeButtonGroupItem={buttonGroupOptions.activeButtonGroup}
                        modalStyle={tailwind('font-semibold text-xs')}
                        testID='balance_button_group'
                      />
                    </View>
              }
            </>
          }
        />
      </>
    )
}
