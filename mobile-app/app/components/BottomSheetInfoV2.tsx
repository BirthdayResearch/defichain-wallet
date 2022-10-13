import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { StyleProp, TextStyle, View } from "react-native";
import { BottomSheetModalV2 } from "./BottomSheetModalV2";
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "./themed";

export interface BottomSheetAlertInfoV2 {
  title: string;
  message: string;
}

interface BottomSheetInfoV2Props {
  name?: string;
  alertInfo?: BottomSheetAlertInfoV2;
  infoIconStyle?: StyleProp<TextStyle>;
  triggerComponent?: JSX.Element;
  snapPoints?: (string | number)[];
  styledMessage?: JSX.Element;
}

export function BottomSheetInfoV2({
  name,
  alertInfo,
  triggerComponent,
  snapPoints,
  styledMessage,
}: BottomSheetInfoV2Props): JSX.Element {
  return (
    <BottomSheetModalV2 // V2 component for close modal x button and rounded edges
      name={name}
      index={0}
      snapPoints={snapPoints ?? ["30%"]}
      alertInfo={alertInfo}
      enablePanDownToClose={false}
      triggerComponent={
        triggerComponent ?? (
          <ThemedIcon
            size={16}
            name="info-outline"
            iconType="MaterialIcons"
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
          />
        )
      }
      handleComponent={EmptyHandleComponent}
      enableScroll={false}
    >
      <View style={tailwind("px-5 pt-4")}>
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("flex-row py-5 border-b-0.5")}
        >
          <ThemedTextV2
            style={tailwind("pr-10 text-xl font-normal-v2")}
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
          >
            {translate("components/BottomSheetInfo", alertInfo?.title ?? "")}
          </ThemedTextV2>
        </ThemedViewV2>
        <View>
          <ThemedTextV2
            style={tailwind("text-base font-normal-v2", {
              "pt-4": alertInfo?.message,
            })}
          >
            {translate("components/BottomSheetInfo", alertInfo?.message ?? "")}
          </ThemedTextV2>
          {styledMessage}
        </View>
      </View>
    </BottomSheetModalV2>
  );
}

function EmptyHandleComponent(): JSX.Element {
  return <View />;
}
