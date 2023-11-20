import { memo, useCallback, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { StackScreenProps } from "@react-navigation/stack";
import { BottomSheetWithNavRouteParam } from "@components/BottomSheetWithNav";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
} from "@components/themed";
import { BottomSheetScrollView, TouchableOpacity } from "@gorhom/bottom-sheet";
import { Platform, View } from "react-native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { LabeledAddress, LocalAddress } from "@store/userPreferences";
import { useThemeContext, useWalletNodeContext } from "@waveshq/walletkit-ui";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { useWalletAddress, WalletAddressI } from "@hooks/useWalletAddress";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { transactionQueue } from "@waveshq/walletkit-ui/dist/store";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { ButtonV2 } from "@components/ButtonV2";
import { debounce } from "lodash";
import { useToast } from "react-native-toast-notifications";
import { RandomAvatar } from "./RandomAvatar";

export interface CreateOrEditAddressLabelFormProps {
  title: string;
  address?: string;
  addressLabel?: LocalAddress;
  onSaveButtonPress: (labelAddress: LabeledAddress) => void;
}

type Props = StackScreenProps<
  BottomSheetWithNavRouteParam,
  "CreateOrEditAddressLabelFormProps"
>;

export const CreateOrEditAddressLabelForm = memo(
  ({ route, navigation }: Props): JSX.Element => {
    const { title, address, addressLabel, onSaveButtonPress } = route.params;
    const { isLight } = useThemeContext();
    const { domain } = useDomainContext();
    const { account } = useWalletContext();
    const [showToast, setShowToast] = useState(false);
    const toast = useToast();
    const dispatch = useAppDispatch();
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [privateKey, setPrivateKey] = useState<string>("");
    const [walletAddress, setWalletAddress] = useState<WalletAddressI[]>([]);
    const { fetchWalletAddresses } = useWalletAddress();
    const walletAddressFromStore = useSelector(
      (state: RootState) => state.userPreferences.addresses,
    );
    const [labelInput, setLabelInput] = useState(addressLabel?.label);
    const bottomSheetComponents = {
      mobile: BottomSheetScrollView,
      web: ThemedScrollViewV2,
    };
    const ScrollView =
      Platform.OS === "web"
        ? bottomSheetComponents.web
        : bottomSheetComponents.mobile;
    const [labelInputErrorMessage, setLabelInputErrorMessage] = useState("");
    const [labelInputLength, setLabelInputLength] = useState(0);

    useEffect(() => {
      fetchWalletAddresses().then((walletAddresses) => {
        setWalletAddress(walletAddresses);
      });
    }, [fetchWalletAddresses]);

    useEffect(() => {
      if (labelInput !== undefined) {
        setLabelInputLength(labelInput.trim().length);
      }
    }, [labelInput]);

    const validateLabelInput = (input: string): boolean => {
      const trimmedInput = input.trim();
      if (trimmedInput !== undefined) {
        if (input.trim().length > 40) {
          setLabelInputErrorMessage("Invalid label. Maximum of 40 characters.");
          return false;
        }

        if (trimmedInput === "") {
          setLabelInputErrorMessage("Label cannot be empty.");
          return false;
        }

        // check if label exists in address book
        if (
          walletAddress.some(
            (item) =>
              item.generatedLabel === trimmedInput && item.dvm !== address,
          )
        ) {
          setLabelInputErrorMessage("Use a unique wallet label.");
          return false;
        }

        // Check walletAddressFromStore object
        if (
          Object.values(walletAddressFromStore).some(
            (item) => item.label === trimmedInput && item.address !== address,
          )
        ) {
          setLabelInputErrorMessage("Use a unique wallet label");
          return false;
        }
      }

      setLabelInputErrorMessage("");
      return true;
    };

    const handleEditSubmit = async (): Promise<void> => {
      if (
        labelInput === undefined ||
        address === undefined ||
        !validateLabelInput(labelInput)
      ) {
        return;
      }
      onSaveButtonPress({
        [address]: {
          address: address,
          evmAddress: getEVMAddress(address),
          label: labelInput.trim(),
        },
      });
    };
    const {
      data: { type },
    } = useWalletNodeContext();
    const isEncrypted = type === "MNEMONIC_ENCRYPTED";
    const showPrivateKey = useCallback(async () => {
      if (!isEncrypted) {
        return;
      }

      dispatch(
        transactionQueue.actions.push({
          sign: async (
            account: WhaleWalletAccount,
          ): Promise<CTransactionSegWit | null> => {
            const key = (await account.privateKey()).toString("hex");
            setPrivateKey(key);
            return null;
          },
          title: translate(
            "components/CreateOrEditAddressLabelForm",
            "Verify access to view private key",
          ),
        }),
      );
    }, [dispatch, isEncrypted, account]);

    const TOAST_DURATION = 2000;
    const copyToClipboard = useCallback(
      debounce(() => {
        if (showToast) {
          return;
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), TOAST_DURATION);
      }, 500),
      [showToast],
    );

    useEffect(() => {
      if (showToast) {
        toast.show(translate("components/toaster", "Copied"), {
          type: "wallet_toast",
          placement: "top",
          duration: TOAST_DURATION,
        });
      } else {
        toast.hideAll();
      }
    }, [showToast]);

    const getEVMAddress = (address: string) => {
      const storedWalletAddress = walletAddressFromStore[
        address
      ] as LocalAddress;
      if (storedWalletAddress && storedWalletAddress.evmAddress) {
        return storedWalletAddress.evmAddress;
      }
      // to support backward compatibility for already saved address
      const addressObj = walletAddress.find((a) => a.dvm === address);
      return addressObj?.evm ?? "";
    };

    const isSaveDisabled = (): boolean => {
      return (
        labelInput === undefined ||
        labelInput === "" ||
        labelInput === addressLabel?.label ||
        labelInputErrorMessage !== ""
      );
    };

    return (
      <ScrollView
        contentContainerStyle={tailwind("pb-6")}
        testID="create_or_edit_label_address_form"
        style={tailwind("px-4 pt-2 flex-1", {
          "bg-mono-dark-v2-100": !isLight,
          "bg-mono-light-v2-100": isLight,
        })}
      >
        <View style={tailwind("flex-1")}>
          <ThemedTextV2
            testID="form_title"
            style={tailwind("flex-1 text-center font-normal-v2 text-xl")}
          >
            {translate("components/CreateOrEditAddressLabelForm", title)}
          </ThemedTextV2>
        </View>
        {address !== undefined && (
          <AddressDisplay
            address={address}
            label={domain === DomainType.DVM ? address : getEVMAddress(address)}
          />
        )}
        {privateKey === "" ? (
          <>
            <ThemedTextV2
              style={tailwind("font-normal-v2 text-xs mt-4 mb-2 ml-5")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {translate("components/CreateOrEditAddressLabelForm", "LABEL")}
            </ThemedTextV2>
            <WalletTextInputV2
              value={labelInput}
              inputType="default"
              displayClearButton={
                isEditable && labelInput !== "" && labelInput !== undefined
              }
              onChangeText={(text: string) => {
                setLabelInput(text);
                validateLabelInput(text);
                setLabelInputLength(text.trim().length);
              }}
              onClearButtonPress={() => {
                setLabelInput("");
                setLabelInputErrorMessage("");
              }}
              placeholder={translate(
                "components/CreateOrEditAddressLabelForm",
                "Enter label",
              )}
              style={tailwind("h-9 w-6/12 flex-grow")}
              hasBottomSheet
              valid={labelInputErrorMessage === ""}
              inlineText={{
                type: "error",
                text: translate(
                  "components/CreateOrEditAddressLabelForm",
                  labelInputErrorMessage,
                ),
              }}
              editable={isEditable}
              testID="address_book_label_input"
            >
              {!isEditable && (
                <TouchableOpacity
                  onPress={() => setIsEditable(true)}
                  testID="edit_label_button"
                >
                  <ThemedIcon
                    light={tailwind("text-mono-light-v2-700")}
                    dark={tailwind("text-mono-dark-v2-700")}
                    style={tailwind("ml-2")}
                    iconType="Feather"
                    name="edit-2"
                    size={16}
                  />
                </TouchableOpacity>
              )}
            </WalletTextInputV2>
            {labelInputErrorMessage === "" && isEditable && (
              <ThemedTextV2
                style={tailwind("font-normal-v2 text-xs mt-2 ml-5")}
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
              >
                {translate(
                  "components/CreateOrEditAddressLabelForm",
                  "{{length}}/40 characters",
                  { length: labelInputLength.toString() },
                )}
              </ThemedTextV2>
            )}
            <View style={tailwind("mt-4")}>
              {isEditable ? (
                <SubmitButtonGroup
                  isDisabled={isSaveDisabled()}
                  isCancelDisabled={false}
                  label={translate(
                    "components/CreateOrEditAddressLabelForm",
                    "Save changes",
                  )}
                  onCancel={() => navigation.goBack()}
                  onSubmit={handleEditSubmit}
                  displayCancelBtn
                  title="save_address_label"
                />
              ) : (
                <SubmitButtonGroup
                  isDisabled={false}
                  isCancelDisabled={false}
                  label={translate(
                    "components/CreateOrEditAddressLabelForm",
                    "Show private key",
                  )}
                  onCancel={() => navigation.goBack()}
                  onSubmit={showPrivateKey}
                  displayCancelBtn
                  title="show_private_key"
                />
              )}
            </View>
          </>
        ) : (
          <>
            <View
              style={tailwind(
                "mb-2 px-5 py-3 border-0.5 border-orange-v2 rounded-lg-v2 mt-10",
              )}
            >
              <ThemedTextV2
                light={tailwind("text-orange-v2")}
                dark={tailwind("text-orange-v2")}
                style={tailwind("text-xs font-normal-v2")}
                testID="conversion_required_warning"
              >
                {translate(
                  "components/CreateOrEditAddressLabelForm",
                  "Your private key provides full access to your account and funds.",
                )}
              </ThemedTextV2>
              <ThemedTextV2
                light={tailwind("text-orange-v2")}
                dark={tailwind("text-orange-v2")}
                style={tailwind("text-xs font-normal-v2 mt-5")}
                testID="conversion_required_warning"
              >
                {translate(
                  "components/CreateOrEditAddressLabelForm",
                  "Make sure you keep this private. Do not share this with anyone or take a screenshot of it.",
                )}
              </ThemedTextV2>
            </View>
            <ThemedTextV2
              style={tailwind("font-normal-v2 text-xs mt-4 mb-2 ml-5")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {translate(
                "components/CreateOrEditAddressLabelForm",
                "PRIVATE KEY",
              )}
            </ThemedTextV2>
            <WalletTextInputV2
              value={privateKey}
              inputType="default"
              displayClearButton={
                isEditable && labelInput !== "" && labelInput !== undefined
              }
              style={tailwind("h-9 w-6/12 flex-grow")}
              inputContainerStyle={tailwind("py-4.5")}
              hasBottomSheet
              multiline
              editable={false}
              testID="address_book_private_key"
            >
              {!isEditable && (
                <TouchableOpacity
                  onPress={async () => {
                    copyToClipboard();
                    await Clipboard.setStringAsync(privateKey);
                  }}
                  testID="edit_label_button"
                >
                  <ThemedIcon
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
                    style={tailwind("ml-2")}
                    iconType="Feather"
                    name="copy"
                    size={16}
                  />
                </TouchableOpacity>
              )}
            </WalletTextInputV2>
            <View style={tailwind("mt-4")}>
              <ButtonV2
                onPress={() => setPrivateKey("")}
                label={translate(
                  "components/CreateOrEditAddressLabelForm",
                  "Done",
                )}
              />
            </View>
          </>
        )}
      </ScrollView>
    );
  },
);

function AddressDisplay({
  address,
  label,
}: {
  address: string;
  label: string;
}): JSX.Element {
  return (
    <View style={tailwind("flex flex-col mt-8 items-center")}>
      <RandomAvatar name={address} size={64} />
      <ThemedTextV2
        style={tailwind(
          "mt-2 flex-1 font-normal-v2 text-sm text-center w-3/5",
          { "w-10/12": Platform.OS === "web" },
        )}
      >
        {label}
      </ThemedTextV2>
    </View>
  );
}
