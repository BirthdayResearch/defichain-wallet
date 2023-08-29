import { View } from "react-native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { AddressType } from "@waveshq/walletkit-ui/dist/store";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacity,
  ThemedViewV2,
} from "@components/themed";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { Control, Controller } from "react-hook-form";
import { NetworkName } from "@defichain/jellyfish-network";
import { fromAddress } from "@defichain/jellyfish-address";
import {
  LocalAddress,
  WhitelistedAddress,
  selectAllLabeledWalletAddress,
} from "@store/userPreferences";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { WalletAddressI, useWalletAddress } from "@hooks/useWalletAddress";

export function AddressRow({
  control,
  networkName,
  onContactButtonPress,
  onQrButtonPress,
  onClearButtonPress,
  onAddressChange,
  inputFooter,
  title,
  address,
  onMatchedAddress,
  onAddressType,
  showQrButton = true,
  onlyLocalAddress,
}: {
  control: Control;
  networkName: NetworkName;
  onContactButtonPress: () => void;
  onQrButtonPress?: () => void;
  onClearButtonPress: () => void;
  onAddressChange: (address: string) => void;
  inputFooter?: React.ReactElement;
  title: string;
  address: string;
  onMatchedAddress?: (
    matchedAddress?: LocalAddress | WhitelistedAddress,
  ) => void;
  onAddressType?: (addressType?: AddressType) => void;
  showQrButton?: boolean;
  onlyLocalAddress?: boolean;
}): JSX.Element {
  const { fetchWalletAddresses } = useWalletAddress();

  const defaultValue = "";

  const addressBook = useSelector(
    (state: RootState) => state.userPreferences.addressBook,
  );
  const walletAddress = useSelector((state: RootState) =>
    selectAllLabeledWalletAddress(state.userPreferences),
  );

  const [jellyfishWalletAddress, setJellyfishWalletAddresses] = useState<
    WalletAddressI[]
  >([]);
  const [matchedAddress, setMatchedAddress] = useState<
    LocalAddress | WhitelistedAddress
  >();
  const [addressType, setAddressType] = useState<AddressType>();
  const validLocalAddress = useMemo(() => {
    if (address === "") {
      return true;
    }
    if (onlyLocalAddress) {
      return addressType === AddressType.WalletAddress;
    }
    return true;
  }, [onlyLocalAddress, addressType, address]);

  const debounceMatchAddress = debounce(() => {
    if (
      address !== undefined &&
      addressBook !== undefined &&
      addressBook[address] !== undefined
    ) {
      setMatchedAddress(addressBook[address]);
      setAddressType(AddressType.Whitelisted);
    } else if (
      address !== undefined &&
      walletAddress !== undefined &&
      walletAddress[address] !== undefined
    ) {
      setMatchedAddress(walletAddress[address]);
      setAddressType(AddressType.WalletAddress);
    } else {
      const addressObj = jellyfishWalletAddress.find(
        (e: WalletAddressI) => e.dvm === address || e.evm === address,
      );
      if (address !== undefined && addressObj) {
        // wallet address that does not have a label
        setMatchedAddress({
          address: addressObj.dvm,
          evmAddress: addressObj.evm,
          label: "",
        });
        setAddressType(AddressType.WalletAddress);
      } else {
        setMatchedAddress(undefined);
        if (onlyLocalAddress) {
          setAddressType(undefined);
        } else {
          setAddressType(
            fromAddress(address, networkName) !== undefined
              ? AddressType.OthersButValid
              : undefined,
          );
        }
      }
    }
  }, 200);

  useEffect(() => {
    debounceMatchAddress();
  }, [address, addressBook]);

  useEffect(() => {
    fetchWalletAddresses().then((walletAddresses) =>
      setJellyfishWalletAddresses(walletAddresses),
    );
  }, [fetchWalletAddresses]);

  useEffect(() => {
    if (onMatchedAddress !== undefined) {
      onMatchedAddress(matchedAddress);
    }
  }, [matchedAddress]);

  useEffect(() => {
    if (onAddressType !== undefined) {
      onAddressType(addressType);
    }
  }, [addressType]);

  return (
    <View style={tailwind("flex-col")}>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name="address"
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          const hasValidAddress = error?.type == null && validLocalAddress;
          return (
            <View style={tailwind("flex w-full")}>
              <WalletTextInputV2
                autoCapitalize="none"
                multiline
                onBlur={async () => {
                  await onAddressChange(value?.trim());
                }}
                onChangeText={onChange}
                placeholder={translate("screens/SendScreen", "Paste address")}
                style={tailwind("w-3/5 flex-grow pb-1 font-normal-v2")}
                testID="address_input"
                value={value}
                displayClearButton={value !== defaultValue}
                onClearButtonPress={onClearButtonPress}
                title={title}
                titleTestID="title_to_address"
                inputType="default"
                inputFooter={inputFooter}
                valid={hasValidAddress}
              >
                {value !== "" && <View style={tailwind("mr-2")} />}
                {value === "" && (
                  <>
                    <ThemedTouchableOpacity
                      dark={tailwind("bg-black")}
                      light={tailwind("bg-white")}
                      onPress={onContactButtonPress}
                      style={tailwind("w-9 p-1.5 rounded")}
                      testID="address_book_button"
                    >
                      <ThemedIcon
                        iconType="Feather"
                        dark={tailwind("text-mono-dark-v2-700")}
                        light={tailwind("text-mono-light-v2-700")}
                        name="users"
                        size={24}
                      />
                    </ThemedTouchableOpacity>
                    {showQrButton && (
                      <ThemedTouchableOpacity
                        dark={tailwind("bg-black")}
                        light={tailwind("bg-white")}
                        onPress={onQrButtonPress}
                        style={tailwind("w-9 p-1.5 rounded")}
                        testID="qr_code_button"
                      >
                        <ThemedIcon
                          dark={tailwind("text-mono-dark-v2-700")}
                          light={tailwind("text-mono-light-v2-700")}
                          iconType="MaterialIcons"
                          name="qr-code"
                          size={24}
                        />
                      </ThemedTouchableOpacity>
                    )}
                  </>
                )}
              </WalletTextInputV2>
              {/* TODO: Replace with inline comment if possible @pierregee */}
              {/* TODO: Update with required error message also */}
              {!hasValidAddress && (
                <ThemedTextV2
                  style={tailwind("text-xs mt-2 mx-5 font-normal-v2")}
                  dark={tailwind("text-red-v2")}
                  light={tailwind("text-red-v2")}
                  testID="address_error_text"
                >
                  {translate(
                    "screens/SendScreen",
                    "Invalid address. Make sure the address is correct to avoid irrecoverable losses",
                  )}
                </ThemedTextV2>
              )}
            </View>
          );
        }}
        rules={{
          required: true,
          validate: {
            isValidAddress: (address) =>
              fromAddress(address, networkName) !== undefined &&
              (!onlyLocalAddress ||
                jellyfishWalletAddress.includes(address) ||
                (walletAddress !== undefined &&
                  walletAddress[address] !== undefined)),
          },
        }}
      />

      {addressType !== undefined && (
        <View style={tailwind("ml-5 my-2 items-center flex flex-row")}>
          {addressType === AddressType.OthersButValid ? (
            <>
              <ThemedIcon
                light={tailwind("text-success-500")}
                dark={tailwind("text-darksuccess-500")}
                iconType="MaterialIcons"
                name="check-circle"
                size={16}
              />
              <ThemedTextV2
                style={tailwind("text-xs mx-1 font-normal-v2")}
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
              >
                {translate("screens/SendScreen", "Verified")}
              </ThemedTextV2>
            </>
          ) : (
            addressType !== undefined &&
            validLocalAddress && (
              <ThemedViewV2
                style={tailwind(
                  "flex flex-row items-center overflow-hidden rounded-lg py-0.5",
                  {
                    "px-1": addressType === AddressType.WalletAddress,
                    "px-2": addressType === AddressType.Whitelisted,
                  },
                )}
                light={tailwind("bg-mono-light-v2-200")}
                dark={tailwind("bg-mono-dark-v2-200")}
              >
                {addressType === AddressType.WalletAddress && (
                  <View style={tailwind("rounded-l-2xl mr-1")}>
                    <RandomAvatar name={matchedAddress?.address} size={12} />
                  </View>
                )}

                <ThemedTextV2
                  ellipsizeMode="middle"
                  numberOfLines={1}
                  style={[
                    tailwind("text-xs font-normal-v2"),
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      minWidth: 10,
                      maxWidth: 108,
                    },
                  ]}
                  light={tailwind("text-mono-light-v2-500")}
                  dark={tailwind("text-mono-dark-v2-500")}
                  testID="address_input_footer"
                >
                  {matchedAddress?.label !== ""
                    ? matchedAddress?.label
                    : matchedAddress.address}
                </ThemedTextV2>
              </ThemedViewV2>
            )
          )}
        </View>
      )}
    </View>
  );
}
