import { ThemedIcon } from "@components/themed";
import { tailwind } from "@tailwind";
import { useMemo } from "react";
import { Platform } from "react-native";

export function BackIcon(props: { tintColor: string }): JSX.Element {
  const name = useMemo(
    () => (Platform.OS === "ios" ? "chevron-left" : "arrow-left"),
    [Platform.OS],
  );

  return (
    <ThemedIcon
      light={tailwind("text-mono-light-v2-900")}
      dark={tailwind("text-mono-dark-v2-900")}
      iconType="Feather"
      name={name}
      size={24}
      {...props}
    />
  );
}
