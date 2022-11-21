import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { validateMnemonicSentence } from "@defichain/jellyfish-wallet-mnemonic";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createRef, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { WalletAlert } from "@components/WalletAlert";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";
import {
  CreateWalletStepIndicator,
  RESTORE_STEPS,
} from "@components/CreateWalletStepIndicator";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { WalletParamList } from "../../WalletNavigator";

export function RestoreMnemonicWallet(): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>();
  const {
    control,
    formState: { isValid, isDirty },
    getValues,
    trigger,
  } = useForm({ mode: "onChange" });
  const [recoveryWords] = useState<number[]>(
    Array.from(Array(24), (v, i) => i + 1)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputRefMap, setInputRefMap] = useState<
    Array<React.RefObject<TextInput>>
  >([]);
  const { isLight } = useThemeContext();

  useEffect(() => {
    recoveryWords.forEach((r) => {
      inputRefMap[r] = createRef<TextInput>();
      setInputRefMap(inputRefMap);
    });
  }, []);

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      if (!isDirty) {
        // If we don't have unsaved changes, then we don't need to do anything
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving the screen
      WalletAlert({
        title: translate("screens/RestoreWallet", "Discard changes?"),
        message: translate(
          "screens/RestoreWallet",
          "You have unsaved changes. Are you sure to discard them and leave the screen?"
        ),
        buttons: [
          {
            text: translate("screens/RestoreWallet", "Cancel"),
            style: "cancel",
            onPress: () => {},
          },
          {
            text: translate("screens/RestoreWallet", "Discard"),
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      });
    });
    return () => {
      navigation.removeListener("beforeRemove", () => {});
    };
  }, [navigation, isDirty]);

  async function onRestore(): Promise<void> {
    setIsSubmitting(true);
    const words = Object.values(getValues());
    if (isValid && validateMnemonicSentence(words)) {
      setIsSubmitting(false);
      navigation.navigate({
        name: "PinCreation",
        params: {
          words,
          pinLength: 6,
          type: "restore",
        },
        merge: true,
      });
    } else {
      setIsSubmitting(false);
      WalletAlert({
        title: translate("screens/RestoreWallet", "Error"),
        message: translate(
          "screens/RestoreWallet",
          "The recovery words you have entered are invalid. Please double check and try again."
        ),
        buttons: [{ text: "OK" }],
      });
    }
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tailwind("pt-12 px-5 pb-16")}
      style={tailwind(
        `${isLight ? "bg-mono-light-v2-100" : "bg-mono-dark-v2-100"}`
      )}
    >
      <View style={tailwind("px-5 mb-12")}>
        <CreateWalletStepIndicator
          current={1}
          steps={RESTORE_STEPS}
          style={tailwind("px-16")}
        />
        <ThemedTextV2
          style={tailwind("text-base mt-7 text-center font-normal-v2")}
        >
          {translate(
            "screens/RestoreWallet",
            "Key in the 24 recovery words to regain access to your wallet."
          )}
        </ThemedTextV2>
      </View>

      {recoveryWords.map((order) =>
        inputRefMap?.[order] != null ? (
          <Controller
            control={control}
            defaultValue=""
            key={order}
            name={`recover_word_${order}`}
            render={({
              field: { name, value, onChange },
              fieldState: { invalid, error },
            }) => (
              <ThemedViewV2 style={tailwind("flex-row py-1.5 pr-3")}>
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-500")}
                  dark={tailwind("text-mono-dark-v2-500")}
                  style={[
                    tailwind("ml-5 mr-1 py-2 font-normal-v2 text-sm", {
                      "mt-px": Platform.OS === "android",
                    }),
                    { width: 26 },
                  ]}
                >
                  {`${order}.`}
                </ThemedTextV2>
                <WalletTextInputV2
                  autoCapitalize="none"
                  autoComplete="off"
                  blurOnSubmit={false}
                  onBlur={async () => {
                    onChange(value.trim());
                    await trigger(name);
                  }}
                  inputType="default"
                  keyboardType="default"
                  onChangeText={onChange}
                  displayClearButton={value !== ""}
                  onClearButtonPress={() => onChange("")}
                  onSubmitEditing={async () => {
                    if (inputRefMap[order + 1] !== undefined) {
                      inputRefMap[order + 1].current?.focus();
                    } else {
                      await onRestore();
                    }
                  }}
                  placeholder={translate(
                    "screens/RestoreWallet",
                    "Enter word #{{order}}",
                    { order }
                  )}
                  placeholderTextColor={
                    isLight
                      ? getColor("mono-light-v2-500")
                      : getColor("mono-dark-v2-500")
                  }
                  ref={inputRefMap[order]}
                  returnKeyType={order === 24 ? "done" : "next"}
                  containerStyle="flex-1"
                  valid={!invalid}
                  testID={`recover_word_${order}`}
                  value={value}
                  inlineText={{
                    type: "error",
                    text: error?.message,
                  }}
                />
              </ThemedViewV2>
            )}
            rules={{
              validate: (value) => {
                const trimmedValue = value.trim();
                if (trimmedValue === undefined || trimmedValue === "") {
                  return translate(
                    "screens/RestoreWallet",
                    "Required field is missing"
                  );
                } else if (!/^[a-z]+$/.test(trimmedValue)) {
                  return translate(
                    "screens/RestoreWallet",
                    "Uppercase, numbers and special characters are not allowed"
                  );
                }
                return true;
              },
            }}
          />
        ) : (
          <SkeletonLoader
            key={order}
            row={1}
            screen={SkeletonLoaderScreen.MnemonicWordV2}
          />
        )
      )}

      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
        style={tailwind("text-xs mt-12 text-center font-normal-v2")}
      >
        {translate(
          "screens/RestoreWallet",
          "All questions must be answered correctly."
        )}
      </ThemedTextV2>

      <ButtonV2
        styleProps="mt-5 mx-7"
        disabled={!isValid || isSubmitting}
        label={translate("screens/RestoreWallet", "Restore")}
        onPress={onRestore}
        testID="recover_wallet_button"
      />
    </KeyboardAwareScrollView>
  );
}
