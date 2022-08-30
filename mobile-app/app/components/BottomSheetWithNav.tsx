/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { theme } from '../tailwind.config'
import { CreateOrEditAddressLabelFormProps } from '@screens/AppNavigator/screens/Portfolio/components/CreateOrEditAddressLabelForm'
import { getDefaultThemeV2 } from '@constants/ThemeV2'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

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
      handleComponent={EmptyHandleComponent}
      keyboardBlurBehavior='restore'
      backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
        <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
      )}
      backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
        <View
          {...backgroundProps}
          style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white' : 'bg-dfxblue-800 border-dfxblue-900'} rounded`)]}
        />
      )}
    >
      <Navigator {...props} />
    </BottomSheetModal>
  )
})

const EmptyHandleComponent = (): JSX.Element => {
  return <></>
}

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
  const { isFeatureAvailable } = useFeatureFlagContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  DeFiChainTheme.colors.background = theme.extend.colors.dfxblue[800] // TODO (thabrad) check if still needed
  const DeFiChainThemeV2: Theme = getDefaultThemeV2(isLight)
  const BottomSheetWithNavStack = createStackNavigator<BottomSheetWithNavRouteParam>()
  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.SlideFromRightIOS,
      headerShown: true,
      headerStyle: {
        borderTopWidth: 1,
        borderTopColor: theme.extend.colors.dfxblue[900],
        backgroundColor: theme.extend.colors.dfxblue[800]
      },
      headerMode: 'screen'
    }),
    []
  )

  return (
    // <NavigationContainer independent theme={isFeatureAvailable('onboarding_v2') ? DeFiChainThemeV2 : DeFiChainTheme}>
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
