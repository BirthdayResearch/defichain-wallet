import { translate } from "@translations";
import { tailwind } from "@tailwind";
import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { canOpenURL } from "expo-linking";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";

export function ProposalURLInput(): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [input, setInput] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ProposalInputStatus>(
    ProposalInputStatus.Default
  );
  const hasInput = input !== "" && input !== undefined;

  useEffect(() => {
    async function checkUrlValidity() {
      if (!hasInput) {
        setStatus(ProposalInputStatus.Default);
        return;
      }
      setStatus(ProposalInputStatus.Verifying);
      const isValid = await canOpenURL(input);
      setStatus(
        isValid ? ProposalInputStatus.Verified : ProposalInputStatus.Invalid
      );
    }

    checkUrlValidity();
  }, [input]);

  const onQrButtonPress = (): void => {
    navigation.navigate({
      name: "BarCodeScanner",
      params: {
        onQrScanned: (value: string) => {
          setInput(value);
        },
        title: translate("screens/ProposalDetailScreen", "Scan Github URL"),
      },
      merge: true,
    });
  };

  return (
    <View style={tailwind("flex")}>
      <WalletTextInputV2
        inputType="default"
        title={translate("screens/ProposalDetailScreen", "GITHUB DISCUSSION")}
        placeholder={translate("screens/ProposalDetailScreen", "Paste URL")}
        inputContainerStyle={tailwind("px-5 py-4.5")}
        displayClearButton={hasInput}
        valid={status !== ProposalInputStatus.Invalid}
        value={input}
        onChangeText={(text: string) => {
          setInput(text);
        }}
        onClearButtonPress={() => {
          setInput("");
        }}
      >
        {!hasInput && (
          <InputComponent status={status} onQrPressed={onQrButtonPress} />
        )}
      </WalletTextInputV2>
      <InlineState status={status} />
    </View>
  );
}

function InputComponent({
  status,
  onQrPressed,
}: {
  status: ProposalInputStatus;
  onQrPressed: () => void;
}): JSX.Element {
  return status === ProposalInputStatus.Verifying ? (
    <ThemedActivityIndicatorV2 />
  ) : (
    <ThemedTouchableOpacityV2
      onPress={onQrPressed}
      style={tailwind("border-0")}
      testID="qr_code_button"
    >
      <ThemedIcon
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
        iconType="MaterialIcons"
        name="qr-code"
        size={20}
      />
    </ThemedTouchableOpacityV2>
  );
}

function InlineState({ status }: { status: ProposalInputStatus }): JSX.Element {
  let displayText;
  switch (status) {
    case ProposalInputStatus.Verified:
      displayText = "Verified";
      break;
    case ProposalInputStatus.Invalid:
      displayText = "Invalid URL";
      break;
    default:
      displayText = "Add URL here to get started";
      break;
  }
  const translatedText = translate("screens/ProposalDetailScreen", displayText);

  return (
    <View style={tailwind("mt-2 ml-5")}>
      {status === ProposalInputStatus.Verified ? (
        <View style={tailwind("flex flex-row items-center")}>
          <ThemedIcon
            iconType="MaterialIcons"
            light={tailwind("text-green-v2")}
            dark={tailwind("text-green-v2")}
            name="check-circle"
            size={16}
          />
          <ThemedTextV2
            style={tailwind("font-normal-v2 text-xs ml-1")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
          >
            {translatedText}
          </ThemedTextV2>
        </View>
      ) : (
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-xs")}
          light={tailwind("text-mono-light-v2-500", {
            "text-red-v2": status === ProposalInputStatus.Invalid,
          })}
          dark={tailwind("text-mono-dark-v2-500", {
            "text-red-v2": status === ProposalInputStatus.Invalid,
          })}
        >
          {translatedText}
        </ThemedTextV2>
      )}
    </View>
  );
}

export enum ProposalInputStatus {
  Default,
  Verifying,
  Verified,
  Invalid,
}
