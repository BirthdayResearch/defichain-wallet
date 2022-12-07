import { ThemedIcon, ThemedTouchableOpacityV2 } from "@components/themed";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useStyles } from "@tailwind";
import { BottomSheetWithNavRouteParam } from "@components/BottomSheetWithNav";
import * as React from "react";

export function BottomSheetHeaderBackButton(): JSX.Element {
  const { tailwind } = useStyles();
  const navigation =
    useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>();
  return (
    <ThemedTouchableOpacityV2
      style={tailwind("border-0 ml-3 mt-2")}
      onPress={() => navigation.goBack()}
    >
      <ThemedIcon iconType="Feather" name="chevron-left" size={24} />
    </ThemedTouchableOpacityV2>
  );
}
