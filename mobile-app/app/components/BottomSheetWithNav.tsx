import { useMemo } from 'react'
import * as React from 'react'
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets
} from '@react-navigation/stack'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { NavigationContainer, Theme } from '@react-navigation/native'
import { AddOrRemoveCollateralFormProps } from '@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm'
import { Platform, View } from 'react-native'
import { tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getDefaultTheme } from '@constants/Theme'
import { BottomSheetModal as BottomSheetModalWeb } from './BottomSheetModal.web'
import { CreateOrEditAddressLabelFormProps } from '@screens/AppNavigator/screens/Balances/components/CreateOrEditAddressLabelForm'

interface BottomSheetWithNavProps {
  modalRef: React.Ref<BottomSheetModalMethods>
  screenList: BottomSheetNavScreen[]
  snapPoints?: {
    ios: string[]
    android: string[]
  }
}

export interface BottomSheetNavScreen {
  stackScreenName: string
  component: React.ComponentType<any>
  option?: StackNavigationOptions
  initialParam?: Partial<BottomSheetWithNavRouteParam['AddOrRemoveCollateralFormProps']>
}

export interface BottomSheetWithNavRouteParam {
  AddOrRemoveCollateralFormProps: AddOrRemoveCollateralFormProps
  CreateOrEditAddressLabelFormProps: CreateOrEditAddressLabelFormProps

  [key: string]: undefined | object
}

export const BottomSheetWithNav = React.memo((props: BottomSheetWithNavProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const getSnapPoints = (): string[] => {
    if (Platform.OS === 'ios') {
      return props.snapPoints?.ios ?? ['50%']
    } else if (Platform.OS === 'android') {
      return props.snapPoints?.android ?? ['60%']
    }
    return []
  }

  return (
    <BottomSheetModal
      ref={props.modalRef}
      index={0}
      snapPoints={getSnapPoints()}
      enablePanDownToClose={false}
      keyboardBlurBehavior='restore'
      backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
        <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
      )}
      backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
        <View
          {...backgroundProps}
          style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white' : 'bg-gray-800'} rounded`)]}
        />
      )}
    >
      <Navigator {...props} />
    </BottomSheetModal>
  )
})

export const BottomSheetWebWithNav = React.memo((props: BottomSheetWithNavProps & { isModalDisplayed: boolean, modalStyle?: { [other: string]: any} }): JSX.Element => {
  return (
    <BottomSheetModalWeb
      screenList={props.screenList}
      ref={props.modalRef}
      isModalDisplayed={props.isModalDisplayed}
      modalStyle={props.modalStyle}
    >
      <View style={tailwind('h-full')}>
        <Navigator {...props} />
      </View>
    </BottomSheetModalWeb>
  )
})

const Navigator = (props: BottomSheetWithNavProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const BottomSheetWithNavStack = createStackNavigator<BottomSheetWithNavRouteParam>()
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

  return (
    <NavigationContainer independent theme={DeFiChainTheme}>
      <BottomSheetWithNavStack.Navigator screenOptions={screenOptions}>
        {props.screenList.map(screen => (
          <BottomSheetWithNavStack.Screen
            key={screen.stackScreenName}
            name={screen.stackScreenName}
            component={screen.component}
            options={screen.option}
            initialParams={screen.initialParam}
          />
        ))}
      </BottomSheetWithNavStack.Navigator>
    </NavigationContainer>
  )
}
