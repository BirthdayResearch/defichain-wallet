import { View, Text } from "react-native";
import { ThemedTouchableOpacityV2 } from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { useThemeContext } from "@waveshq/walletkit-ui";
import React from "react";
import { useDomainContext } from "@shared-contexts/DomainProvider";
import { DomainPersistence } from "@api";
import { tailwind } from "@tailwind";
import { LinearGradient } from "expo-linear-gradient";

export function DomainSwitch({ testID }: { testID: string }): JSX.Element {
  const { isLight } = useThemeContext();
  const { domain, setDomain } = useDomainContext();
  const isEvmDomain = domain !== "DFI";
  const DFIIcon = getNativeIcon("DFIlogo");

  return (
    <View
      style={tailwind("h-7 w-18 rounded-full flex-row justify-center mr-4", {
        "bg-mono-light-v2-300": isLight,
        "bg-mono-dark-v2-300": !isLight,
      })}
      testID={testID}
    >
      <ThemedTouchableOpacityV2
        activeOpacity={1}
        onPress={async () => {
          setDomain(domain === "DFI" ? "EVM" : "DFI");
          await DomainPersistence.set(domain);
        }}
        style={tailwind(
          "flex-1 flex-row justify-center rounded-full items-center p-0 absolute left-0"
        )}
      >
        <View
          style={tailwind(
            "rounded-full p-1 flex-row items-center",
            {
              "bg-transparent": isEvmDomain,
              "bg-mono-light-v2-1000": isLight && !isEvmDomain,
              "bg-mono-dark-v2-1000": !isLight && !isEvmDomain,
            },
            {
              hidden: isEvmDomain,
              flex: !isEvmDomain,
            }
          )}
        >
          <View style={tailwind("bg-brand-v2-500 p-1 rounded-full mr-1")}>
            <DFIIcon width={12.5} height={12.5} color="#FFFFFF" />
          </View>

          <Text
            style={tailwind("mr-2", {
              "text-white": isLight,
              "text-black": !isLight,
            })}
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
        style={tailwind(
          "flex-1 rounded-full flex-row justify-center items-center absolute right-0"
        )}
      >
        <LinearGradient
          colors={["#42F9C2", "#3B57CF"]}
          start={[0, 0]}
          end={[1, 1]}
          style={tailwind("rounded-full")}
        >
          <View
            style={tailwind(
              "rounded-full p-1 flex-row items-center",
              {
                "bg-transparent": !isEvmDomain,
              },
              {
                hidden: !isEvmDomain,
                flex: isEvmDomain,
              }
            )}
          >
            <LinearGradient
              colors={["#42F9C2", "#3B57CF"]}
              start={[0, 0]}
              end={[1, 1]}
              style={tailwind(
                "flex items-center justify-center rounded-full mr-1 w-5 h-5"
              )}
            >
              <View
                style={tailwind(
                  "bg-mono-light-v2-00 flex items-center justify-center rounded-full w-4 h-4"
                )}
              >
                <DFIIcon width={12.5} height={12.5} color="#FF008C" />
              </View>
            </LinearGradient>

            <Text style={tailwind("text-mono-light-v2-00")}>EVM</Text>
          </View>
        </LinearGradient>
      </ThemedTouchableOpacityV2>
    </View>
  );
}
