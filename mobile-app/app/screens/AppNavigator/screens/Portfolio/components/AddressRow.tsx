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
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { Control, Controller } from "react-hook-form";
import { NetworkName } from "@defichain/jellyfish-network";
import { fromAddress } from "@defichain/jellyfish-address";
import {
  LocalAddress,
  selectAllLabeledWalletAddress,
  WhitelistedAddress,
} from "@store/userPreferences";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useWalletAddress, WalletAddressI } from "@hooks/useWalletAddress";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import {
  AddressType as JellyfishAddressType,
  getAddressType,
} from "@waveshq/walletkit-core";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { AddressEvmTag } from "@components/AddressEvmTag";

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
  matchedAddress,
  setMatchedAddress,
  setAddressLabel,
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
  matchedAddress?: LocalAddress | WhitelistedAddress | undefined;
  setMatchedAddress?: (address?: LocalAddress | WhitelistedAddress) => void;
  setAddressLabel?: React.Dispatch<React.SetStateAction<string | undefined>>;
}): JSX.Element {
  const { fetchWalletAddresses } = useWalletAddress();
  const { domain } = useDomainContext();

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
  const [addressType, setAddressType] = useState<AddressType>();
  const [validEvmAddress, setValidEvmAddress] = useState<boolean>(false);

  const validLocalAddress = useMemo(() => {
    if (address === "") {
      return true;
    }
    if (onlyLocalAddress) {
      return addressType === AddressType.WalletAddress;
    }
    return true;
  }, [onlyLocalAddress, addressType, address]);

  const addressObj = jellyfishWalletAddress.find(
    (e: WalletAddressI) => e.dvm === address || e.evm === address,
  );

  const displayAddressLabel =
    matchedAddress?.label !== ""
      ? matchedAddress?.label
      : addressObj?.generatedLabel;

  const debounceMatchAddress = debounce(() => {
    // Check if address input field is not empty
    if (address !== undefined && setMatchedAddress !== undefined) {
      if (addressBook !== undefined && addressBook[address] !== undefined) {
        // Whitelisted Addresses
        setMatchedAddress(addressBook[address]);
        setAddressType(AddressType.Whitelisted);
        return;
      }

      // Your Address - Labelled
      if (walletAddress !== undefined && walletAddress[address] !== undefined) {
        setMatchedAddress(walletAddress[address]);
        setAddressType(AddressType.WalletAddress);
        return;
      }

      if (addressObj) {
        // Your addresses - Unlabelled
        setMatchedAddress({
          address: addressObj.dvm,
          evmAddress: addressObj.evm,
          label: "",
        });
        setAddressType(AddressType.WalletAddress);
      } else {
        setMatchedAddress(undefined); // Unsaved valid DVM address
        if (onlyLocalAddress) {
          setAddressType(undefined);
        } else if (
          getAddressType(address, networkName) === JellyfishAddressType.ETH
        ) {
          // Unsaved and valid EVM address
          setAddressType(AddressType.OthersButValid);
          setValidEvmAddress(true);
        } else {
          setValidEvmAddress(false);
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
    if (setAddressLabel !== undefined) {
      setAddressLabel(displayAddressLabel);
    }
  }, [displayAddressLabel]);

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
              // Check if its either a valid EVM/DVM address &&
              !!getAddressType(address, networkName) &&
              // EVM -> EVM domain transfer is not allowed
              !(
                getAddressType(address, networkName) ===
                  JellyfishAddressType.ETH && domain === DomainType.EVM
              ),
          },
        }}
      />

      <View style={tailwind("ml-5 my-2 items-center flex flex-row")}>
        {addressType !== undefined && (
          <>
            {/* Verified tag for unsaved but verified DVM/EVM address */}
            {addressType === AddressType.OthersButValid &&
              !(
                domain === DomainType.EVM &&
                getAddressType(address, networkName) ===
                  JellyfishAddressType.ETH
              ) && (
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
                    {translate("screens/SendScreen", "Verified {{text}}", {
                      text: validEvmAddress
                        ? "MetaChain (EVM) address"
                        : "DVM address",
                    })}
                  </ThemedTextV2>
                </>
              )}

            {/* Whitelisted and Yours Addresses */}
            {addressType !== AddressType.OthersButValid &&
              validLocalAddress && (
                <>
                  {/* Checks if selected address is  a Whitelisted EVM address */}
                  {(matchedAddress as WhitelistedAddress)?.addressDomainType ===
                    DomainType.EVM ||
                  //   Check if selected address from Your Addresses is EVM address
                  getAddressType(address, networkName) ===
                    JellyfishAddressType.ETH ? (
                    <AddressEvmTag testID="address_input_footer">
                      <>
                        {addressType === AddressType.WalletAddress && (
                          <View style={tailwind("rounded-l-2xl mr-1")}>
                            <RandomAvatar
                              name={matchedAddress?.address}
                              size={12}
                            />
                          </View>
                        )}
                        <ThemedTextV2
                          testID="address_input_footer_evm"
                          style={tailwind(
                            "text-mono-light-v2-00 text-xs font-normal-v2 tracking-[0.24]",
                          )}
                          light={tailwind("text-mono-light-v2-1000")}
                          dark={tailwind("text-mono-dark-v2-1000")}
                        >
                          {displayAddressLabel}
                        </ThemedTextV2>
                      </>
                    </AddressEvmTag>
                  ) : (
                    // Whitelisted address - DVM
                    <ThemedViewV2
                      style={tailwind(
                        "flex flex-row items-center overflow-hidden rounded-lg py-0.5 px-2",
                      )}
                      light={tailwind("bg-mono-light-v2-200")}
                      dark={tailwind("bg-mono-dark-v2-200")}
                    >
                      {addressType === AddressType.WalletAddress && (
                        <View style={tailwind("rounded-l-2xl mr-1")}>
                          <RandomAvatar
                            name={matchedAddress?.address}
                            size={12}
                          />
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
                        light={tailwind("text-mono-light-v2-900")}
                        dark={tailwind("text-mono-dark-v2-900")}
                        testID="address_input_footer"
                      >
                        {displayAddressLabel}
                      </ThemedTextV2>
                    </ThemedViewV2>
                  )}
                </>
              )}
          </>
        )}
      </View>
    </View>
  );
}
