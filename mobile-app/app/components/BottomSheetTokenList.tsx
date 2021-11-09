import React, { memo, useMemo } from 'react'
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets
} from '@react-navigation/stack'
import { NavigationProp, useNavigation } from '@react-navigation/core'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { NavigationContainer } from '@react-navigation/native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { SymbolIcon } from './SymbolIcon'
import { TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { AddOrEditCollateralFormProps } from '@screens/AppNavigator/screens/Loans/components/AddOrEditCollateralForm'

interface BottomSheetTokenListProps {
  modalRef: React.Ref<BottomSheetModalMethods>
  modalHeaderLabel: string
  onCloseButtonPress: () => void
  onTokenPress?: () => void
  secondScreen: Screen
}

interface Token {
  id: string
  name: string
  available: BigNumber
  collateralFactor: BigNumber
}

interface Screen {
  title: string
  component: React.ComponentType<any>
}

export interface BottomSheetTokenListRouteParam {
  AddOrEditCollateralForm: AddOrEditCollateralFormProps
  [key: string]: undefined | object
}

export function BottomSheetTokenList (props: BottomSheetTokenListProps): JSX.Element {
  const BottomSheetTokenListStack = createStackNavigator<BottomSheetTokenListRouteParam>()
  const Navigator = (): JSX.Element => {
    const screenOptions = useMemo<StackNavigationOptions>(
      () => ({
        ...TransitionPresets.SlideFromRightIOS,

        headerShown: true,
        safeAreaInsets: { top: 0 },
        cardStyle: {
          backgroundColor: 'white',
          overflow: 'visible'
        },
        headerMode: 'screen'
      }),
      []
    )

    const TokenListScreenOptions = useMemo(() => ({
       headerLeft: () => null,
       header: () => null
    }), [])
    return (
      <NavigationContainer independent>
        <BottomSheetTokenListStack.Navigator screenOptions={screenOptions}>
          <BottomSheetTokenListStack.Screen
            name='TokenListScreen'
            options={TokenListScreenOptions}
            component={createTokenList(tokenList, props.modalHeaderLabel, props.onCloseButtonPress, props.onTokenPress)}
          />
          {props.secondScreen !== undefined && (
            <BottomSheetTokenListStack.Screen
              name={props.secondScreen.title}
              component={props.secondScreen.component}
            />
          )}
        </BottomSheetTokenListStack.Navigator>
      </NavigationContainer>
    )
  }
  const tokenList: Token[] = [
    {
      id: 'DFI',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dBTC',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dETH',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    },
    {
      id: 'dLTC',
      name: 'DFI',
      available: new BigNumber('123'),
      collateralFactor: new BigNumber(100)
    }

  ]
  return (
    <BottomSheetModal
      ref={props.modalRef}
      index={0}
      snapPoints={['50%']}
    >
      <Navigator />
    </BottomSheetModal>
  )
}

const createTokenList = (tokenList: Token[], headerLabel: string, onCloseButtonPress: () => void, onTokenPress?: (token: Token) => void): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const navigation = useNavigation<NavigationProp<BottomSheetTokenListRouteParam>>()
  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('')}
      data={tokenList}
      renderItem={({ item }): JSX.Element => (
        <ThemedTouchableOpacity
          onPress={() => {
            if (onTokenPress !== undefined) {
              onTokenPress(item)
            } else {
              navigation.navigate({
                name: 'AddOrEditCollateralForm',
                params: {
                  token: item.id,
                  available: item.available,
                  collateralFactor: item.collateralFactor,
                  onButtonPress: () => {}
                },
                merge: true
              })
            }
          }}
          style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
        >
          <View style={tailwind('flex flex-row items-center')}>
            <SymbolIcon symbol={item.id} styleProps={{ width: 24, height: 24 }} />
            <View style={tailwind('ml-2')}>
              <ThemedText>{item.id}</ThemedText>
              <ThemedText>{item.name}</ThemedText>
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
                  style={tailwind('mr-2')}
                >
                  {value}
                </ThemedText>}
            />
            <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={12} />
          </View>
        </ThemedTouchableOpacity>
      )}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b')}
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
    />
  )
})
