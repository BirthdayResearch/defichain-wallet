import { ThemedView, ThemedFlatList, ThemedTouchableOpacity } from '@components/themed'
import { BalanceParamList } from '../BalancesNavigator'
import { BalanceRowToken } from '../BalancesScreen'
import { StackNavigationProp } from '@react-navigation/stack'
import { View } from '@components'
import { translate } from '@translations'
import tailwind from 'tailwind-rn'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { EmptyBalances } from './EmptyBalances'
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { getNativeIcon } from '@components/icons/assets'
// import BigNumber from 'bignumber.js'

export enum ButtonGroupTabKey {
  AllTokens = 'ALL_TOKENS',
  LPTokens = 'LP_TOKENS',
  Crypto = 'CRYPTO',
  dTokens = 'd_TOKENS'
}

interface BalanceCardProps {
  filteredTokens: BalanceRowToken[]
  navigation: StackNavigationProp<BalanceParamList>
  buttonGroupOptions?: {
    onButtonGroupPress: (key: ButtonGroupTabKey) => void
    activeButtonGroup: string
    setActiveButtonGroup: (key: ButtonGroupTabKey) => void
  }
}

export function BalanceCards ({
  filteredTokens,
  navigation,
  buttonGroupOptions
}: BalanceCardProps): JSX.Element {
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
      id: ButtonGroupTabKey.dTokens,
      label: translate('screens/BalancesScreen', 'dTokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.dTokens)
    }
  ]
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    if (buttonGroupOptions !== undefined) {
      buttonGroupOptions.setActiveButtonGroup(buttonGroupTabKey)
      buttonGroupOptions.onButtonGroupPress(buttonGroupTabKey)
    }
  }

  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))

  const renderItem = ({
    item,
    index
  }: {
    item: BalanceRowToken
    index: number
  }): JSX.Element => {
    return (
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        style={tailwind('mb-2 rounded')}
      >
        <View testID='card_balance_row_container'>
          <BalanceItemRow
            onPress={() => navigation.navigate({
                name: 'TokenDetail',
                params: { token: item },
                merge: true
              })}
            token={item}
            key={index}
          />
        </View>
      </ThemedView>
    )
  }
  const filterCriteria = 'defaultId'
  const sortFilter = (filteredTokens: BalanceRowToken[]): BalanceRowToken[] => {
    // filter criteria
    switch (filterCriteria) {
      // case 'highest':
      //   return filteredTokens.sort((a, b) => new BigNumber(b.usdAmount).minus(new BigNumber(a.usdAmount)).toNumber())
      default:
        return filteredTokens.sort((a, b) => a.id.localeCompare(b.id))
    }

    // highest value

    // lowest value

    // return []
  }

  return (
    <ThemedFlatList
      light={tailwind('bg-gray-50')}
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={sortFilter(filteredTokens)} // TODO: sorting function
      keyExtractor={(item) => item.id}
      testID='portfolio_balance_tab'
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          {
            // filter tab
            buttonGroupOptions !== undefined &&
            (
              <>
                <View style={tailwind('mb-4')}>
                  <ButtonGroup
                    buttons={buttonGroup}
                    activeButtonGroupItem={buttonGroupOptions.activeButtonGroup}
                    modalStyle={tailwind('font-semibold text-center text-xs py-1')}
                    testID='balance_button_group'
                  />
                </View>
              </>
            )
          }
          {
            // display loader if fetching
            !hasFetchedToken &&
              <View style={tailwind('')}>
                <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Balance} />
              </View>
          }
          {
            // display empty balance
            filteredTokens.length === 0 &&
              <EmptyBalances />
          }
        </>
      }
    />
  )
}

function BalanceItemRow ({
  token,
  onPress
}: { token: BalanceRowToken, onPress: () => void }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `balances_row_${token.id}`
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-white')}
      onPress={onPress}
      style={tailwind('p-4 rounded-lg flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />
        <TokenNameText displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
        <TokenAmountText
          tokenAmount={token.amount} usdAmount={token.usdAmount} testID={testID}
          isBalancesDisplayed={isBalancesDisplayed}
        />
      </View>
    </ThemedTouchableOpacity>
  )
}
