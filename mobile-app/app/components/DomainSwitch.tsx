import { View, Text } from "react-native";
import { ThemedTouchableOpacityV2 } from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { useThemeContext } from "@waveshq/walletkit-ui";
import React from "react";
import { useDomainContext, DomainType } from "@contexts/DomainContext";
import { tailwind } from "@tailwind";
import { LinearGradient } from "expo-linear-gradient";

export function DomainSwitch({ testID }: { testID: string }): JSX.Element {
  const { isLight } = useThemeContext();
  const { domain, setDomain } = useDomainContext();
  const DFIIcon = getNativeIcon("DFIlogo");
  const EvmDFIIcon = getNativeIcon("EvmDFI");

  const toggleDomain = async () => {
    await setDomain(
      domain === DomainType.DVM ? DomainType.EVM : DomainType.DVM,
    );
  };
  return (
    <ThemedTouchableOpacityV2
      activeOpacity={0.7}
      light={tailwind("bg-mono-light-v2-300")}
      dark={tailwind("bg-mono-dark-v2-300")}
      style={tailwind("h-7 w-21 rounded-full flex-row justify-center mr-4")}
      onPress={toggleDomain}
      testID={testID}
    >
      {domain === DomainType.DVM && (
        <View
          style={tailwind(
            "flex-1 flex-row justify-center rounded-full items-center p-0 absolute left-0",
          )}
        >
          <View
            style={tailwind("rounded-full p-1 flex-row items-center", {
              "bg-mono-light-v2-1000": isLight,
              "bg-mono-dark-v2-1000": !isLight,
            })}
          >
            <View style={tailwind("bg-brand-v2-500 p-1 rounded-full mr-1")}>
              <DFIIcon width={12} height={12} color="#FFFFFF" />
            </View>

            <Text
              style={tailwind("w-9 text-xs font-normal-v2", {
                "text-white": isLight,
                "text-black": !isLight,
              })}
              testID={`${testID}_DVM`}
            >
              DVM
            </Text>
          </View>
        </View>
      )}
      {domain === DomainType.EVM && (
        <View
          style={tailwind(
            "flex-1 rounded-full flex-row justify-center items-center absolute right-0",
          )}
        >
          <LinearGradient
            colors={["#42F9C2", "#3B57CF"]}
            start={[0, 0]}
            end={[1, 1]}
            style={tailwind("rounded-full")}
          >
            <View style={tailwind("rounded-full p-1 flex-row items-center")}>
              <View
                style={tailwind(
                  "flex items-center justify-center rounded-full w-5 h-5",
                )}
              >
                <EvmDFIIcon width={20} height={20} />
              </View>

              <Text
                style={tailwind(
                  "text-mono-light-v2-00 text-xs ml-1 w-9 font-normal-v2",
                )}
                testID={`${testID}_EVM`}
              >
                EVM
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </ThemedTouchableOpacityV2>
  );
}
