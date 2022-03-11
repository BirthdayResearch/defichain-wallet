import { ThemedFlatList, ThemedTouchableOpacity } from '@components/themed'
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
    console.log('item', item)
    console.log('filteredTokens', filteredTokens)
    console.log('=====')

    return (

      <View testID='card_balance_row_container'>

        <View key={index}>
          <BalanceItemRow
            onPress={() => navigation.navigate({
              name: 'TokenDetail',
              params: { token: item },
              merge: true
            })}
            token={item}
          />
        </View>
      </View>
    )
  }

  return (
    <ThemedFlatList
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={filteredTokens}
      numColumns={1}
      windowSize={2}
      // initialNumToRender={5}
      // keyExtractor={(item) => item.data.id}
      testID=''
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          {
            buttonGroupOptions !== undefined &&
            (
              <>
                <View style={tailwind('mb-4')}>
                  <ButtonGroup buttons={buttonGroup} activeButtonGroupItem={buttonGroupOptions.activeButtonGroup} testID='dex_button_group' />
                </View>
              </>
            )
}
          {
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
      dark={tailwind('bg-gray-800')}
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
