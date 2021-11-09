import React, { useMemo } from 'react'
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets
} from '@react-navigation/stack'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { NavigationContainer, Theme } from '@react-navigation/native'
import { AddOrEditCollateralFormProps } from '@screens/AppNavigator/screens/Loans/components/AddOrEditCollateralForm'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getDefaultTheme } from '@constants/Theme'

interface BottomSheetWithNavProps {
  modalRef: React.Ref<BottomSheetModalMethods>
  screenList: BottomSheetNavScreen[]
}

export interface BottomSheetNavScreen {
  stackScreenName: string
  component: React.ComponentType<any>
  option?: StackNavigationOptions
  initialParam?: Partial<Object | undefined>
}

export interface BottomSheetWithNavRouteParam {
  AddOrEditCollateralForm: AddOrEditCollateralFormProps
  [key: string]: undefined | object
}

export const BottomSheetWithNav = React.memo((props: BottomSheetWithNavProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const BottomSheetWithNavStack = createStackNavigator<BottomSheetWithNavRouteParam>()
  const Navigator = (): JSX.Element => {
    const screenOptions = useMemo<StackNavigationOptions>(
      () => ({
        ...TransitionPresets.SlideFromRightIOS,

        headerShown: true,
        // safeAreaInsets: { top: 0 },
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

  return (
    <BottomSheetModal
      ref={props.modalRef}
      index={0}
      snapPoints={['50%']}
      backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
        <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
      )}
      backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
        <View {...backgroundProps} style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} border-t rounded`)]} />
      )}
    >
      <Navigator />
    </BottomSheetModal>
  )
})
