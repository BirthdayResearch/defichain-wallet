import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { AddLiquiditySummary, ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityConfirmScreen } from './DexConfirmRemoveLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { DexScreen } from './DexScreen'
import { ConfirmPoolSwapScreen, DexForm } from './PoolSwap/ConfirmPoolSwapScreen'
import { DerivedTokenState, PoolSwapScreen } from './PoolSwap/PoolSwapScreen'
import { DexGuidelines } from './DexGuidelines'
import { useDexProvider } from '@contexts/DexContext'
import { NavigationProp, useNavigation } from '@react-navigation/core'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'

export interface DexParamList {
  DexScreen: undefined
  PoolSwapScreen: { poolpair: PoolPairData }
  ConfirmPoolSwapScreen: {
    tokenA: DerivedTokenState
    tokenB: DerivedTokenState
    swap: DexForm
    fee: BigNumber
    pair: PoolPairData
    slippage: number
  }
  AddLiquidity: { pair: PoolPairData }
  ConfirmAddLiquidity: { pair: PoolPairData, summary: AddLiquiditySummary }
  RemoveLiquidity: { pair: PoolPairData }
  ConfirmRemoveLiquidity: { amount: BigNumber, fee: BigNumber, pair: PoolPairData, tokenAAmount: string, tokenBAmount: string }

  [key: string]: undefined | object
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  const { displayGuidelines, setDisplayGuidelines } = useDexProvider()
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  const headerContainerTestId = 'dex_header_container'
  const screenOptions = { headerTitleStyle: HeaderFont, headerBackTitleVisible: false }

  if (displayGuidelines) {
    const onDexGuidelinesClose = async (): Promise<void> => {
      await setDisplayGuidelines(false)
      navigation.navigate('DexScreen')
    }

    return (
      <DexStack.Navigator
        initialRouteName='DexGuidelines'
        screenOptions={screenOptions}
      >
        <DexStack.Screen
          component={DexGuidelines}
          name='DexGuidelines'
          options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexGuidelines', 'Guidelines')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerRight: (): JSX.Element => (
            <TouchableOpacity
              onPress={onDexGuidelinesClose}
              testID='close_dex_guideline'
            >
              <ThemedIcon
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                iconType='MaterialIcons'
                name='close'
                size={24}
              />
            </TouchableOpacity>
          )
        }}
        />
      </DexStack.Navigator>
    )
  }

  return (
    <DexStack.Navigator
      initialRouteName='DexScreen'
      screenOptions={screenOptions}
    >
      <DexStack.Screen
        component={DexScreen}
        name='DexScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Decentralized Exchange')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={AddLiquidityScreen}
        name='AddLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Add Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={ConfirmAddLiquidityScreen}
        name='ConfirmAddLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Add Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={RemoveLiquidityScreen}
        name='RemoveLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Remove Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={RemoveLiquidityConfirmScreen}
        name='RemoveLiquidityConfirmScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm removal')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={PoolSwapScreen}
        name='PoolSwap'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Decentralized Exchange')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={ConfirmPoolSwapScreen}
        name='ConfirmPoolSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm swap')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false
        }}
      />
    </DexStack.Navigator>
  )
}
