import { StackScreenProps } from "@react-navigation/stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useLayoutEffect } from "react";
import { StyleSheet } from "react-native";
import tailwind from "tailwind-rn";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { translate } from "@translations";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { ThemedText } from "./themed";
import { View } from ".";

type Props = StackScreenProps<PortfolioParamList, "BarCodeScanner">;

export function BarCodeScanner({ route, navigation }: Props): JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();
  const logger = useLogger();

  useEffect(() => {
    requestPermission().catch(logger.error);
  }, []);

  useLayoutEffect(() => {
    if (
      route.params !== undefined &&
      route.params.title !== undefined &&
      route.params.title !== ""
    ) {
      navigation.setOptions({
        headerTitle: route.params.title,
      });
    }
  }, [navigation]);

  if (!permission) {
    return (
      <View style={tailwind("flex-col flex-1 justify-center items-center")}>
        <ThemedText>
          {translate(
            "components/BarCodeScanner",
            "Requesting for camera permission",
          )}
        </ThemedText>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={tailwind("flex-col flex-1 justify-center items-center")}>
        <ThemedText>
          {translate(
            "components/BarCodeScanner",
            "You have denied the permission request to use your camera",
          )}
        </ThemedText>
      </View>
    );
  }

  const opacity = "rgba(0, 0, 0, .6)";
  const styles = StyleSheet.create({
    focused: {
      flex: 5,
    },
    layerBottom: {
      backgroundColor: opacity,
      flex: 2,
    },
    layerCenter: {
      flex: 3,
      // aspectRatio: 1,
      flexDirection: "row",
    },
    layerLeft: {
      backgroundColor: opacity,
      flex: 1,
    },
    layerRight: {
      backgroundColor: opacity,
      flex: 1,
    },
    layerTop: {
      backgroundColor: opacity,
      flex: 2,
    },
  });

  return (
    <>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(e) => {
          route.params.onQrScanned(e.data);
          navigation.pop();
        }}
        style={tailwind("flex-1 absolute inset-0")}
      />

      <View style={styles.layerTop} />

      <View style={styles.layerCenter}>
        <View style={styles.layerLeft} />

        <View style={[styles.focused, tailwind("relative")]}>
          <View
            style={tailwind(
              "border-t-4 border-l-4 border-white w-16 h-16 absolute",
            )}
          />

          <View
            style={tailwind(
              "border-t-4 border-r-4 border-white w-16 h-16 top-0 right-0 absolute",
            )}
          />

          <View
            style={tailwind(
              "border-b-4 border-l-4 border-white w-16 h-16 bottom-0 absolute",
            )}
          />

          <View
            style={tailwind(
              "border-b-4 border-r-4 border-white w-16 h-16 bottom-0 right-0 absolute",
            )}
          />
        </View>

        <View style={styles.layerRight} />
      </View>

      <View style={styles.layerBottom} />
    </>
  );
}
