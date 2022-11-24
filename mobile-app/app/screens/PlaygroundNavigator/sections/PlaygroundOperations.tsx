/* eslint-disable react-native/no-raw-text */
import { View } from "@components";
import { PlaygroundTitle } from "@screens/PlaygroundNavigator/components/PlaygroundTitle";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { usePlaygroundContext } from "@contexts/PlaygroundContext";
import { useEffect, useState } from "react";
import { WalletAddressIndexPersistence } from "@api/wallet/address_index";
import { fetchTokens } from "@store/wallet";
import {
  PlaygroundConnectionStatus,
  PlaygroundStatusType,
} from "@screens/PlaygroundNavigator/components/PlaygroundStatus";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { ThemedViewV2, ThemedIcon } from "@components/themed";
import { tailwind } from "@tailwind";
import { PlaygroundAction } from "../components/PlaygroundAction";

export function PlaygroundOperations(): JSX.Element {
  const { wallet } = useWalletContext();
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();
  const { api, rpc } = usePlaygroundContext();
  const [status, setStatus] = useState<PlaygroundConnectionStatus>(
    PlaygroundConnectionStatus.loading
  );

  useEffect(() => {
    api.wallet
      .balances()
      .then(() => {
        setStatus(PlaygroundConnectionStatus.online);
      })
      .catch(() => {
        setStatus(PlaygroundConnectionStatus.error);
      });
  }, [wallet]);

  const getActiveAddress = async (): Promise<string> => {
    const addressIndex = await WalletAddressIndexPersistence.getActive();
    const account = wallet.get(addressIndex);
    return await account.getAddress();
  };

  const dataLists = [
    {
      title: "Fetch balances",
      onPress: async (): Promise<void> => {
        const address = await getActiveAddress();
        dispatch(
          fetchTokens({
            client,
            address,
          })
        );
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            iconType="Feather"
            name="arrow-down-circle"
            size={18}
          />
        );
      },
      testID: "playground_wallet_fetch_balances",
    },
    {
      title: "Generate block",
      onPress: async (): Promise<void> => {
        await rpc.call(
          "generatetoaddress",
          [10, "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy"],
          "number"
        );
      },
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedIcon
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            iconType="Feather"
            name="plus-circle"
            size={18}
          />
        );
      },
      testID: "playground_generate_blocks",
    },
  ];

  return (
    <View>
      <PlaygroundTitle
        status={{
          online: status === PlaygroundConnectionStatus.online,
          loading: status === PlaygroundConnectionStatus.loading,
          error: status === PlaygroundConnectionStatus.error,
          type: PlaygroundStatusType.secondary,
        }}
        title="OPERATIONS"
      />
      {status === PlaygroundConnectionStatus.online && (
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
              isLast={index === dataLists.length - 1}
              title={dataList.title}
              testID={dataList.testID}
            />
          ))}
        </ThemedViewV2>
      )}
    </View>
  );
}
