/* eslint-disable react-native/no-raw-text */
import { MnemonicStorage } from "@api/wallet/mnemonic_storage";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWalletPersistenceContext } from "@shared-contexts/WalletPersistenceContext";
import { View } from "@components/index";
import { ThemedViewV2, ThemedIcon } from "@components/themed";
import { tailwind } from "@tailwind";
import { PlaygroundStatusType } from "@screens/PlaygroundNavigator/components/PlaygroundStatus";
import { PlaygroundTitle } from "../components/PlaygroundTitle";
import { PlaygroundAction } from "../components/PlaygroundAction";
import { MnemonicEncrypted, MnemonicUnprotected } from "../../../api/wallet";

export function PlaygroundWallet(): JSX.Element | null {
  const { wallets, clearWallets, setWallet } = useWalletPersistenceContext();
  const { network, updateNetwork } = useNetworkContext();

  const dataLists = [
    {
      title: "Clear stored mnemonic seed",
      onPress: async (): Promise<void> => {
        clearWallets();
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="Feather"
            name="refresh-ccw"
            size={18}
          />
        );
      },
      testID: "playground_wallet_clear",
    },
    {
      title:
        "Setup an unprotected wallet with abandon (23 times) + art as the 24 words.",
      onPress: async (): Promise<void> => {
        await updateNetwork(network);
        const data = await MnemonicUnprotected.toData(
          [
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "art",
          ],
          network
        );
        await setWallet(data);
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="Feather"
            name="file-plus"
            size={18}
          />
        );
      },
      testID: "playground_wallet_abandon",
    },
    {
      title:
        "Setup an encrypted wallet with abandon (23 times) + art as the 24 words and 00000 as passcode",
      onPress: async (): Promise<void> => {
        await updateNetwork(network);
        const data = await MnemonicEncrypted.toData(
          [
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "abandon",
            "art",
          ],
          network,
          "000000"
        );
        await setWallet(data);
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="Feather"
            name="file-plus"
            size={18}
          />
        );
      },
      testID: "playground_wallet_abandon_encrypted",
    },
    {
      title:
        "Setup an encrypted wallet with random seed using 000000 as passcode",
      onPress: async (): Promise<void> => {
        await updateNetwork(network);
        const words = MnemonicUnprotected.generateWords();
        const encrypted = await MnemonicEncrypted.toData(
          words,
          network,
          "000000"
        );
        await setWallet(encrypted);
        await MnemonicStorage.set(words, "000000");
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="Feather"
            name="file-plus"
            size={18}
          />
        );
      },
      testID: "playground_wallet_random",
    },
  ];

  return (
    <View>
      <PlaygroundTitle
        status={{
          online: wallets.length > 0,
          offline: wallets.length === 0,
          type: PlaygroundStatusType.secondary,
        }}
        title="WALLET"
      />
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("rounded-lg-v2 px-5")}
      >
        {dataLists.map((dataList, index) => (
          <PlaygroundAction
            key={index}
            // eslint-disable-next-line react/jsx-handler-names
            onPress={dataList.onPress}
            rhsChildren={dataList.rhsChildren}
            title={dataList.title}
            isLast={index === dataLists.length - 1}
            textStyle={tailwind("w-10/12")}
            testID={dataList.testID}
          />
        ))}
      </ThemedViewV2>
    </View>
  );
}
