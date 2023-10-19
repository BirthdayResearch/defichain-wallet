import { View } from "@components";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import {
  ThemedIcon,
  ThemedSectionTitleV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { CustomServiceProviderType } from "@contexts/CustomServiceProvider";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useEffect, useState } from "react";

export interface CustomServiceProvider {
  type: CustomServiceProviderType;
  url: string;
  defaultUrl: string;
  label: string;
  helperText: string;
}

interface Props extends CustomServiceProvider {
  inputValue: { url: string; isValid: boolean };
  isDisabled: boolean;
  activeInput: CustomServiceProviderType | undefined;
  setActiveInput: (type: CustomServiceProviderType | undefined) => void;
  setShowActionButtons: (show: boolean) => void;
  handleUrlInputChange: (
    type: CustomServiceProviderType,
    value: string,
  ) => void;
}

export function CustomUrlInput({
  type,
  url,
  defaultUrl,
  label,
  helperText,
  inputValue,
  isDisabled,
  activeInput,
  setActiveInput,
  setShowActionButtons,
  handleUrlInputChange,
}: Props): JSX.Element {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [displayTickIcon, setDisplayTickIcon] = useState<boolean>(true);

  // clear input on unlock
  useEffect(() => {
    if (isUnlocked && url === defaultUrl) {
      return handleUrlInputChange(type, "");
    }
  }, [isUnlocked]);

  // show err msg when input is invalid
  useEffect(() => {
    if (inputValue.isValid || inputValue.url === "") {
      setErrMsg(undefined);
    } else {
      setErrMsg("Invalid URL");
    }
  }, [inputValue]);

  // to display tick icon
  useEffect(() => {
    if (!isUnlocked && inputValue.isValid) {
      return setDisplayTickIcon(true);
    } else if (inputValue.url === "" && !inputValue.isValid) {
      return setDisplayTickIcon(false);
    }
  }, [inputValue]);

  return (
    <View style={tailwind("pb-4")}>
      <ThemedSectionTitleV2
        testID="endpoint_url_title"
        text={translate("screens/ServiceProviderScreen", label)}
      />
      <View style={tailwind("flex flex-row items-start w-full")}>
        <WalletTextInputV2
          valid={errMsg === undefined}
          editable={isUnlocked}
          value={inputValue.url}
          inputType="default"
          onChangeText={(text: string) => handleUrlInputChange(type, text)}
          onClearButtonPress={() => handleUrlInputChange(type, "")}
          placeholder={translate("screens/ServiceProviderScreen", defaultUrl)}
          style={tailwind("font-normal-v2 flex-1 py-2.5")}
          containerStyle="flex-1 pr-3"
          testID={`${type}_endpoint_url_input`}
          inlineText={{
            type: errMsg !== undefined ? "error" : "helper",
            text: translate(
              "screens/ServiceProviderScreen",
              errMsg || helperText,
            ),
            style: { paddingLeft: 20 },
          }}
          displayClearButton={
            inputValue.url !== "" &&
            inputValue.url !== undefined &&
            isUnlocked &&
            !displayTickIcon
          }
          displayTickIcon={displayTickIcon}
        />
        <ThemedTouchableOpacityV2
          onPress={() => {
            setIsUnlocked(true);
            setShowActionButtons(true);
            setActiveInput(type);
          }}
          light={tailwind("bg-mono-light-v2-900", {
            "bg-opacity-70": isUnlocked,
            "bg-opacity-30":
              (!isUnlocked && activeInput !== undefined) || isDisabled,
          })}
          dark={tailwind("bg-mono-dark-v2-900", {
            "bg-opacity-70": isUnlocked,
            "bg-opacity-30":
              (!isUnlocked && activeInput !== undefined) || isDisabled,
          })}
          style={tailwind("mt-2 h-10 w-10 p-2.5 text-center rounded-full")}
          disabled={isUnlocked || isDisabled}
          testID={`${type}_edit_service_provider`}
        >
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-100")}
            light={tailwind("text-mono-light-v2-100")}
            iconType="Feather"
            name="edit-2"
            size={18}
          />
        </ThemedTouchableOpacityV2>
      </View>
    </View>
  );
}
