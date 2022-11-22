import { RootState } from "@store";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { NumericFormat as NumberFormat } from "react-number-format";
import { TouchableOpacity, Linking } from "react-native";
import { View } from "@components/index";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedViewV2,
  ThemedSectionTitleV2,
} from "@components/themed";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { TextRowV2 } from "@components/TextRowV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { getEnvironment } from "@environment";
import { getReleaseChannel } from "@api/releaseChannel";
import { NetworkItemRow } from "@components/NetworkItemRow";

export function OnboardingNetworkSelectScreen(): JSX.Element {
  const { tailwind } = useStyles();
  const networks = getEnvironment(getReleaseChannel()).networks;
  const {
    count: blockCount,
    masternodeCount,
    lastSuccessfulSync,
  } = useSelector((state: RootState) => state.block);
  const syncFormattedDate =
    lastSuccessfulSync != null ? dayjs(lastSuccessfulSync).format("lll") : "";

  return (
    <ThemedViewV2 testID="network_details" style={tailwind("px-5 flex-1")}>
      <ThemedSectionTitleV2
        testID="onboarding_network_selection_screen_title"
        text={translate(
          "screens/OnboardingNetworkSelectScreen",
          "SELECT NETWORK"
        )}
      />
      <ThemedViewV2
        style={tailwind("px-5 rounded-lg-v2")}
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
      >
        {networks.map((network, index) => (
          <NetworkItemRow
            key={index}
            network={network}
            alertMessage={translate(
              "screens/OnboardingNetworkSelectScreen",
              "You are about to switch to {{network}}. Do you want to proceed?",
              { network: network }
            )}
            isLast={index === networks.length - 1}
          />
        ))}
      </ThemedViewV2>

      <ThemedSectionTitleV2
        testID="network_details_block_info"
        text={translate("screens/NetworkDetails", "DETAILS")}
      />
      <ThemedViewV2
        style={tailwind("p-5 rounded-lg-v2")}
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
      >
        <TextRowV2
          lhs={{ value: translate("screens/NetworkDetails", "Last synced") }}
          rhs={{
            value: syncFormattedDate,
            testID: "network_details_last_sync",
          }}
          containerStyle={{
            style: tailwind(
              "pb-4.5 border-b-0.5 flex-row items-start w-full bg-transparent"
            ),
            light: tailwind("border-mono-light-v2-300"),
            dark: tailwind("border-mono-dark-v2-300"),
          }}
        />
        <BlocksInfoRow blockCount={blockCount} />
        <NumberRowV2
          lhs={{
            value: translate("screens/NetworkDetails", "Total masternodes"),
            testID: "network_details_total_masternodes",
          }}
          rhs={{
            value: masternodeCount ?? "",
            testID: "network_details_total_masternodes",
            themedProps: {
              light: tailwind("text-mono-light-v2-700"),
              dark: tailwind("text-mono-dark-v2-700"),
            },
          }}
          containerStyle={{
            style: tailwind(
              "pt-4.5 flex-row items-start w-full bg-transparent"
            ),
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
        />
      </ThemedViewV2>
    </ThemedViewV2>
  );
}

function BlocksInfoRow({ blockCount }: { blockCount?: number }): JSX.Element {
  const { tailwind } = useStyles();
  const { getBlocksUrl } = useDeFiScanContext();

  const onBlockUrlPressed = async (): Promise<void> => {
    if (blockCount !== undefined) {
      const url = getBlocksUrl(blockCount);
      await Linking.openURL(url);
    }
  };

  return (
    <ThemedViewV2
      style={tailwind(
        "flex-row items-start w-full bg-transparent py-4.5 border-b-0.5"
      )}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <View style={tailwind("w-5/12")}>
        <ThemedTextV2 style={tailwind("font-normal-v2 text-sm")}>
          {translate("screens/NetworkDetails", "Block height")}
        </ThemedTextV2>
      </View>

      <View style={tailwind("flex-1")}>
        <TouchableOpacity
          onPress={onBlockUrlPressed}
          testID="block_detail_explorer_url"
        >
          <View style={tailwind("flex-row items-center justify-end")}>
            <NumberFormat
              displayType="text"
              renderText={(val: string) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  style={tailwind(
                    "text-sm font-normal-v2 flex-wrap text-right"
                  )}
                  testID="network_details_block_height"
                >
                  {val}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={blockCount}
            />
            <View style={tailwind("ml-1 flex-grow-0 justify-center")}>
              <ThemedIcon
                iconType="MaterialIcons"
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
                name="open-in-new"
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedViewV2>
  );
}
