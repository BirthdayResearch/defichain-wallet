import * as React from 'react'
import { useMemo } from 'react'
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { NavigationContainer, Theme } from '@react-navigation/native'
import {
  AddOrRemoveCollateralFormProps
} from '@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm'
import { Platform, View } from 'react-native'
import { tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getDefaultTheme } from '@constants/Theme'
import { BottomSheetModal as BottomSheetModalWeb } from './BottomSheetModal.web'
import {
  CreateOrEditAddressLabelFormProps
} from '@screens/AppNavigator/screens/Portfolio/components/CreateOrEditAddressLabelForm'
import { getDefaultThemeV2 } from '@constants/ThemeV2'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { ThemedViewV2 } from '@components/themed'

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

export const BottomSheetWithNavV2 = React.memo((props: BottomSheetWithNavProps): JSX.Element => {
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
      handleComponent={null}
      enablePanDownToClose={false}
      keyboardBlurBehavior='restore'
      backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
        <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
      )}
      backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
        <ThemedViewV2
          {...backgroundProps}
          style={[backgroundProps.style, tailwind('rounded-t-xl-v2')]}
        />
      )}
    >
      <Navigator {...props} />
    </BottomSheetModal>
  )
})

export const BottomSheetWebWithNavV2 = React.memo((props: BottomSheetWithNavProps & { isModalDisplayed: boolean, modalStyle?: { [other: string]: any } }): JSX.Element => {
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
  const DeFiChainThemeV2: Theme = getDefaultThemeV2(isLight)
  const BottomSheetWithNavStack = createStackNavigator<BottomSheetWithNavRouteParam>()
  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.SlideFromRightIOS,
      headerShown: true,
      safeAreaInsets: { top: 0 },
      cardStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      headerMode: 'screen'
    }),
    []
  )

  return (
    <NavigationContainer independent theme={isFeatureAvailable('onboarding_v2') ? DeFiChainThemeV2 : DeFiChainTheme}>
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
