import { ReactElement, useCallback, useEffect, useRef } from "react";
import { tailwind } from "@tailwind";
import { Platform, StyleProp, View, ViewProps } from "react-native";
import {
  BottomSheetBackgroundProps,
  BottomSheetModal as Modal,
  BottomSheetModalProps,
  TouchableOpacity,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { ScrollView } from "react-native-gesture-handler";
import { ThemedIcon, ThemedProps } from "./themed";
import { WalletAlert } from "./WalletAlert";

type Props = ThemedProps &
  BottomSheetModalProps & {
    triggerComponent: ReactElement;
    children: ReactElement;
    alertInfo?: { title: string; message: string };
    closeButtonStyle?: StyleProp<ViewProps>;
    enableScroll?: boolean;
  };

export function BottomSheetModalV2(props: Props): JSX.Element {
  const bottomSheetModalRef = useRef<Modal>(null);
  const { dismiss } = useBottomSheetModal();
  const { isLight } = useThemeContext();
  const {
    name,
    style,
    children,
    closeButtonStyle,
    handleComponent,
    triggerComponent,
    alertInfo,
    snapPoints = ["100%", "50%"],
    light = tailwind("bg-gray-100 text-black"),
    dark = tailwind("bg-gray-600 text-white text-opacity-90"),
    enableScroll,
    ...otherModalProps
  } = props;
  const isWeb = Platform.OS === "web";

  const openModal = useCallback(() => {
    if (!isWeb) {
      bottomSheetModalRef.current?.present();
    } else if (alertInfo != null) {
      WalletAlert(alertInfo);
    }
  }, []);

  const closeModal = useCallback(() => {
    if (!isWeb) {
      dismiss(name);
    }
  }, []);

  useEffect(() => {
    return () => {
      closeModal();
    };
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={openModal}>
        {triggerComponent}
      </TouchableOpacity>
      {!isWeb && (
        <Modal
          name={name}
          style={style}
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          stackBehavior="replace"
          backgroundStyle={[isLight ? light : dark]}
          backdropComponent={(backdropProps: BottomSheetBackgroundProps) => (
            <View
              {...backdropProps}
              style={[backdropProps.style, tailwind("bg-black bg-opacity-60")]}
            />
          )}
          backgroundComponent={(
            backgroundProps: BottomSheetBackgroundProps
          ) => (
            <View
              {...backgroundProps}
              style={[
                backgroundProps.style,
                tailwind(
                  `${
                    isLight
                      ? "bg-white border-gray-200"
                      : "bg-gray-800 border-gray-700"
                  } rounded-t-xl-v2`
                ),
              ]}
            />
          )}
          handleComponent={handleComponent}
          {...otherModalProps}
        >
          <ScrollView
            contentContainerStyle={tailwind(
              `pb-7 relative ${handleComponent === null ? "pt-7" : "pt-2"}`
            )}
            scrollEnabled={enableScroll}
          >
            <View
              style={[
                tailwind(
                  "absolute flex-row justify-end right-5 top-5 w-full z-10"
                ),
                closeButtonStyle,
              ]}
            >
              <TouchableOpacity onPress={closeModal}>
                <ThemedIcon iconType="Feather" name="x-circle" size={22} />
              </TouchableOpacity>
            </View>
            {children}
          </ScrollView>
        </Modal>
      )}
    </View>
  );
}
