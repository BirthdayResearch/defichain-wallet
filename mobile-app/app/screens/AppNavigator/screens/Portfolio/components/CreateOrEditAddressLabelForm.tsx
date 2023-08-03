import { memo, useEffect, useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { BottomSheetWithNavRouteParam } from "@components/BottomSheetWithNav";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Platform, View } from "react-native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { LabeledAddress, LocalAddress } from "@store/userPreferences";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { WalletAddressI, useWalletAddress } from "@hooks/useWalletAddress";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
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
    const [walletAddress, setWalletAddress] = useState<WalletAddressI[]>([]);
    const { fetchWalletAddresses } = useWalletAddress();
    const walletAddressFromStore = useSelector(
      (state: RootState) => state.userPreferences.addresses
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
      if (input !== undefined) {
        if (input.trim().length > 40) {
          setLabelInputErrorMessage("Invalid label. Maximum of 40 characters.");
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
      if (
        labelInput === undefined ||
        labelInput === addressLabel?.label ||
        labelInputErrorMessage !== ""
      ) {
        return true;
      }

      return false;
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
          displayClearButton={labelInput !== "" && labelInput !== undefined}
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
            "Enter label"
          )}
          style={tailwind("h-9 w-6/12 flex-grow")}
          hasBottomSheet
          valid={labelInputErrorMessage === ""}
          inlineText={{
            type: "error",
            text: translate(
              "components/CreateOrEditAddressLabelForm",
              labelInputErrorMessage
            ),
          }}
          testID="address_book_label_input"
        />
        {labelInputErrorMessage === "" && (
          <ThemedTextV2
            style={tailwind("font-normal-v2 text-xs mt-2 ml-5")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
          >
            {translate(
              "components/CreateOrEditAddressLabelForm",
              "{{length}}/40 characters",
              { length: labelInputLength.toString() }
            )}
          </ThemedTextV2>
        )}

        <View style={tailwind("mt-4")}>
          <SubmitButtonGroup
            isDisabled={isSaveDisabled()}
            isCancelDisabled={false}
            label={translate(
              "components/CreateOrEditAddressLabelForm",
              "Save changes"
            )}
            onCancel={() => navigation.goBack()}
            onSubmit={handleEditSubmit}
            displayCancelBtn
            title="save_address_label"
          />
        </View>
      </ScrollView>
    );
  }
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
          { "w-10/12": Platform.OS === "web" }
        )}
      >
        {label}
      </ThemedTextV2>
    </View>
  );
}
