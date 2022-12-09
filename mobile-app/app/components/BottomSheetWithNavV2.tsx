import React, { useMemo } from "react";
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets,
} from "@react-navigation/stack";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { NavigationContainer } from "@react-navigation/native";
import { AddOrRemoveCollateralFormProps } from "@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm";
import { Platform, View } from "react-native";
import { useStyles } from "@tailwind";
import { CreateOrEditAddressLabelFormProps } from "@screens/AppNavigator/screens/Portfolio/components/CreateOrEditAddressLabelForm";
import { BottomSheetModal as BottomSheetModalWeb } from "./BottomSheetModal.web";

interface BottomSheetWithNavProps {
  modalRef?: React.Ref<BottomSheetModalMethods>;
  screenList: BottomSheetNavScreen[];
  snapPoints?: {
    ios: string[];
    android: string[];
  };
  enablePanDown?: boolean;
}

export interface BottomSheetNavScreen {
  stackScreenName: string;
  component: React.ComponentType<any>;
  option?: StackNavigationOptions;
  initialParam?: Partial<
    BottomSheetWithNavRouteParam["AddOrRemoveCollateralFormProps"]
  >;
}

export interface BottomSheetWithNavRouteParam {
  AddOrRemoveCollateralFormProps: AddOrRemoveCollateralFormProps;
  CreateOrEditAddressLabelFormProps: CreateOrEditAddressLabelFormProps;

  [key: string]: undefined | object;
}

export const BottomSheetWithNavV2 = React.memo(
  (props: BottomSheetWithNavProps): JSX.Element => {
    const { tailwind } = useStyles();
    const { modalRef, snapPoints } = props;

    const getSnapPoints = (): string[] => {
      if (Platform.OS === "ios") {
        return snapPoints?.ios ?? ["50%"];
      } else if (Platform.OS === "android") {
        return snapPoints?.android ?? ["60%"];
      }
      return [];
    };

    return (
      <BottomSheetModal
        ref={modalRef}
        index={0}
        snapPoints={getSnapPoints()}
        handleComponent={EmptyHandleComponent}
        enablePanDownToClose={false}
        keyboardBlurBehavior="restore"
        backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
          <View
            {...backdropProps}
            style={[backdropProps.style, tailwind("bg-black bg-opacity-60")]}
          />
        )}
      >
        <Navigator {...props} />
      </BottomSheetModal>
    );
  }
);

function EmptyHandleComponent(): JSX.Element {
  return <View />;
}

export const BottomSheetWebWithNavV2 = React.memo(
  (
    props: BottomSheetWithNavProps & {
      isModalDisplayed: boolean;
      modalStyle?: { [other: string]: any };
    }
  ): JSX.Element => {
    const { tailwind } = useStyles();
    return (
      <BottomSheetModalWeb
        ref={props.modalRef}
        isModalDisplayed={props.isModalDisplayed}
        modalStyle={props.modalStyle}
      >
        <View style={tailwind("h-full")}>
          <Navigator {...props} />
        </View>
      </BottomSheetModalWeb>
    );
  }
);

function Navigator(props: { screenList: BottomSheetNavScreen[] }): JSX.Element {
  const { tailwind, getDefaultTheme } = useStyles();
  const DeFiChainTheme: Theme = getDefaultTheme();
  const BottomSheetWithNavStack =
    createStackNavigator<BottomSheetWithNavRouteParam>();
  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.SlideFromRightIOS,
      headerShown: true,
      safeAreaInsets: { top: 0 },
      cardStyle: tailwind("bg-black bg-opacity-60"),
      headerMode: "screen",
    }),
    []
  );

  return (
    <NavigationContainer independent theme={DeFiChainTheme}>
      <BottomSheetWithNavStack.Navigator screenOptions={screenOptions}>
        {props.screenList.map((screen) => (
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
  );
}
