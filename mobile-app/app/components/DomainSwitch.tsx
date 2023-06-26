import { View, Text } from "react-native";
import { ThemedTouchableOpacityV2 } from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { useThemeContext } from "@waveshq/walletkit-ui";
import React from "react";
import { useDomainContext } from "@shared-contexts/DomainProvider";
import { DomainPersistence } from "@api";

export function DomainSwitch({
  testID,
  selectionColor,
}: {
  testID: string;
  selectionColor: string;
}): JSX.Element {
  const { isLight } = useThemeContext();
  const { domain, setDomain } = useDomainContext();
  const isEvmDomain = domain !== "DFI";
  const DFIIcon = getNativeIcon("DFIlogo");

  return (
    <View
      style={{
        height: 28,
        width: 76,
        borderRadius: 55,
        backgroundColor: `${isLight ? "#CCCCCC" : "#333333"}`,
        flexDirection: "row",
        justifyContent: "center",
      }}
      testID={testID}
    >
      <ThemedTouchableOpacityV2
        activeOpacity={1}
        onPress={async () => {
          setDomain(domain === "DFI" ? "EVM" : "DFI");
          await DomainPersistence.set(domain);
        }}
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          borderRadius: 55,
          alignItems: "center",
          padding: 0,
        }}
      >
        <View
          style={{
            borderRadius: 55,
            backgroundColor: isEvmDomain
              ? "transparent"
              : isLight
              ? "#000000"
              : "#FFFFFF",
            display: isEvmDomain ? "none" : "flex",
            padding: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FF008C",
              padding: 4,
              borderRadius: 50,
              marginRight: 4,
            }}
          >
            <DFIIcon width={12.5} height={12.5} color="#FFFFFF" />
          </View>

          <Text
            style={{
              color: isLight ? "#FFFFFF" : "#000000",
              marginRight: 8,
            }}
          >
            DFI
          </Text>
        </View>
      </ThemedTouchableOpacityV2>
      <ThemedTouchableOpacityV2
        activeOpacity={1}
        onPress={async () => {
          setDomain(domain === "DFI" ? "EVM" : "DFI");
          await DomainPersistence.set(domain);
        }}
        style={{
          flex: 1,
          borderRadius: 55,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            borderRadius: 55,
            backgroundColor: isEvmDomain ? selectionColor : "transparent",
            display: isEvmDomain ? "flex" : "none",
            padding: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              padding: 4,
              borderRadius: 50,
              marginRight: 4,
            }}
          >
            <DFIIcon width={12.5} height={12.5} color="#FF008C" />
          </View>
          <Text
            style={{
              color: "#FFFFFF",
            }}
          >
            EVM
          </Text>
        </View>
      </ThemedTouchableOpacityV2>
    </View>
  );
}
