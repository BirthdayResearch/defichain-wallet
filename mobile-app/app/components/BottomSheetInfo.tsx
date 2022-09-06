import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { StyleProp, TextStyle, View } from "react-native";
import { ThemedIcon, ThemedText, ThemedTextV2, ThemedViewV2 } from "./themed";
import { BottomSheetModal, BottomSheetModalV2 } from "./BottomSheetModal";

export interface BottomSheetAlertInfo {
  title: string;
  message: string;
}
interface BottomSheetInfoProps {
  name?: string;
  alertInfo?: BottomSheetAlertInfo;
  infoIconStyle?: StyleProp<TextStyle>;
}

export function BottomSheetInfo({
  name,
  alertInfo,
  infoIconStyle,
}: BottomSheetInfoProps): JSX.Element {
  return (
    <BottomSheetModal
      name={name}
      index={0}
      snapPoints={["30%"]}
      alertInfo={alertInfo}
      triggerComponent={
        <ThemedIcon
          size={16}
          name="info-outline"
          iconType="MaterialIcons"
          dark={tailwind("text-gray-200")}
          light={tailwind("text-gray-700")}
          style={infoIconStyle}
        />
      }
      enableScroll={false}
    >
      <View style={tailwind("px-6 pt-0")}>
        <View style={tailwind("flex-row mb-3")}>
          <ThemedIcon
            size={20}
            name="info-outline"
            iconType="MaterialIcons"
            dark={tailwind("text-gray-200")}
            light={tailwind("text-gray-700")}
            style={tailwind("pt-1.5")}
          />
          <ThemedText
            dark={tailwind("text-gray-50")}
            light={tailwind("text-gray-900")}
            style={tailwind("ml-2 pr-10 text-2xl font-semibold")}
          >
            {translate("components/BottomSheetInfo", alertInfo?.title ?? "")}
          </ThemedText>
        </View>
        <View>
          <ThemedText
            style={tailwind("text-base")}
            dark={tailwind("text-gray-200")}
            light={tailwind("text-gray-700")}
          >
            {translate("components/BottomSheetInfo", alertInfo?.message ?? "")}
          </ThemedText>
        </View>
      </View>
    </BottomSheetModal>
  );
}

interface BottomSheetInfoV2Props {
  name?: string;
  alertInfo?: BottomSheetAlertInfo;
  infoIconStyle?: StyleProp<TextStyle>;
  triggerComponent?: JSX.Element;
  snapPoints?: (string | number)[];
  wrappedMessage?: JSX.Element;
}

export function BottomSheetInfoV2({
  name,
  alertInfo,
  triggerComponent,
  snapPoints,
  wrappedMessage,
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
      <View style={tailwind("px-6 pt-4")}>
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("flex-row mb-3 py-5 border-b-0.5")}
        >
          <ThemedTextV2
            style={tailwind("pr-10 text-2xl font-normal-v2 border-b-0.5")}
            light={tailwind("border-mono-light-v2-300 text-mono-light-v2-900")}
            dark={tailwind("border-mono-dark-v2-300 text-mono-dark-v2-900")}
          >
            {translate("components/BottomSheetInfo", alertInfo?.title ?? "")}
          </ThemedTextV2>
        </ThemedViewV2>
        <View>
          <ThemedTextV2 style={tailwind("text-base font-normal-v2")}>
            {translate("components/BottomSheetInfo", alertInfo?.message ?? "")}
          </ThemedTextV2>
        </View>
        <View>{wrappedMessage}</View>
      </View>
    </BottomSheetModalV2>
  );
}

function EmptyHandleComponent(): JSX.Element {
  return <View />;
}
