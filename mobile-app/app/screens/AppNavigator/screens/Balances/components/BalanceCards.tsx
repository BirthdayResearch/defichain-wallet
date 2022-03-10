import { ThemedView } from '@components/themed'
// import { BalanceParamList } from '../BalancesNavigator'
// import { BalanceRowToken, BalanceItemRow } from '../BalancesScreen'
// import { EmptyBalances } from './EmptyBalances'
// import BigNumber from 'bignumber.js'

// import { RootState } from '@store'
// import { useSelector } from 'react-redux'
// import { useState } from 'react'
// import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
// import { StackNavigationProp } from '@react-navigation/stack'

import { View } from '@components'

import { translate } from '@translations'
import tailwind from 'tailwind-rn'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'

export enum ButtonGroupTabKey {
  AllTokens = 'ALL_TOKENS',
  LPTokens = 'LP_TOKENS',
  Crypto = 'CRYPTO',
  dAssets = 'd_ASSETS'
}

interface BalanceCardProps {
  // passed props into BalanceList from Balance screen
  // dstTokens: BalanceRowToken[]
  // navigation: StackNavigationProp<BalanceParamList>

  // required props for tabs - need to pass props from balance screen too
  buttonGroupOptions?: {
    onButtonGroupPress: (key: ButtonGroupTabKey) => void
    activeButtonGroup: string
    setActiveButtonGroup: (key: ButtonGroupTabKey) => void
  }
}

export function BalanceCards ({
  // passed props into BalanceList from Balance screen
  // dstTokens,
  // navigation,

  // required props for tabs - need to pass props from balance screen too
  buttonGroupOptions
}: BalanceCardProps): JSX.Element {
  // TODO: call dstTokens
  // const [expandedCardIds, setExpandedCardIds] = useState<string[]>([])
  // const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet)) // for loading skeleton loader

  const buttonGroup = [
    {
      id: ButtonGroupTabKey.AllTokens,
      label: translate('screens/BalancesScreen', 'All tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
    },
    {
      id: ButtonGroupTabKey.LPTokens,
      label: translate('screens/BalancesScreen', 'LP tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.LPTokens)
    },
    {
      id: ButtonGroupTabKey.Crypto,
      label: translate('screens/BalancesScreen', 'Crypto'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.Crypto)
    },
    {
      id: ButtonGroupTabKey.dAssets,
      label: translate('screens/BalancesScreen', 'dAssets'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.dAssets)
    }
  ]
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    if (buttonGroupOptions !== undefined) {
      // setExpandedCardIds([])
      buttonGroupOptions.setActiveButtonGroup(buttonGroupTabKey)
      buttonGroupOptions.onButtonGroupPress(buttonGroupTabKey)
    }
  }

  return (
    <ThemedView
      light={tailwind('bg-gray-100')}
      dark={tailwind('bg-gray-900')}
      style={tailwind('p-4')}

    >{
        buttonGroupOptions !== undefined &&
          <View style={tailwind('text-xs text-center')}>
            <ButtonGroup
              buttons={buttonGroup}
              activeButtonGroupItem={buttonGroupOptions.activeButtonGroup}
              modalStyle={tailwind('font-semibold text-xs')}
              testID='balance_button_group'
            />
          </View>
      }
    </ThemedView>
  )
}
