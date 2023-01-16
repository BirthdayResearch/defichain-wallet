import { translate } from "@translations";
import { tailwind } from "@tailwind";
import { ThemedIcon, ThemedTextV2 } from "@components/themed";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";

interface ProposalURLInputProps {
  urlValidity: (isValid: boolean) => void;
  onChangeUrlInput: (text: string) => void;
}

export function ProposalURLInput({
  urlValidity,
  onChangeUrlInput,
}: ProposalURLInputProps): JSX.Element {
  const [status, setStatus] = useState<ProposalInputStatus>(
    ProposalInputStatus.Default
  );

  // form
  const {
    control,
    setValue,
    getValues,
    trigger,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
  });
  const url = getValues("url");
  const hasInput = url !== "" && url !== undefined;

  useEffect(() => {
    function checkUrlValidity() {
      if (!hasInput) {
        setStatus(ProposalInputStatus.Default);
        return;
      }
      setStatus(
        isValid ? ProposalInputStatus.Verified : ProposalInputStatus.Invalid
      );
    }

    checkUrlValidity();
  }, [isValid, url]);

  useEffect(() => {
    urlValidity(status === ProposalInputStatus.Verified);
  }, [status]);

  async function setInputValue(value: string) {
    setValue("url", value);
    await trigger("url");
    onChangeUrlInput(value);
  }

  return (
    <View style={tailwind("flex")}>
      <Controller
        control={control}
        defaultValue=""
        name="url"
        render={({ field: { onChange, value } }) => (
          <WalletTextInputV2
            autoCapitalize="none"
            inputType="default"
            multiline
            testID="input_url"
            title={translate("screens/OCGDetailScreen", "GITHUB DISCUSSION")}
            placeholder={translate("screens/OCGDetailScreen", "Paste URL")}
            style={tailwind("w-3/5 flex-grow pb-1 font-normal-v2")}
            displayClearButton={hasInput}
            valid={status !== ProposalInputStatus.Invalid}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              onChangeUrlInput(text);
            }}
            onClearButtonPress={() => setInputValue("")}
          />
        )}
        rules={{
          pattern: /https?:\/\/github\.com\/(?:[^/\s]+\/)+(?:issues\/\d+)$/gm,
        }}
      />

      <InlineState status={status} />
    </View>
  );
}

function InlineState({ status }: { status: ProposalInputStatus }): JSX.Element {
  let displayText;
  switch (status) {
    case ProposalInputStatus.Verified:
      displayText = "Verified";
      break;
    case ProposalInputStatus.Invalid:
      displayText = "URL should be a valid Github URL";
      break;
    default:
      displayText = "Add URL here to get started";
      break;
  }
  const translatedText = translate("screens/OCGDetailScreen", displayText);

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
            testID="url_valid_text"
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
          testID="url_status_text"
        >
          {translatedText}
        </ThemedTextV2>
      )}
    </View>
  );
}

export enum ProposalInputStatus {
  Default,
  Verified,
  Invalid,
}
