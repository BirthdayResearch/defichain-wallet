import { ThemedScrollViewV2 } from "@components/themed";
import {
  useNetworkContext,
  WalletNodeProvider,
  useWalletPersistenceContext,
} from "@waveshq/walletkit-ui";
import { WalletContextProvider } from "@shared-contexts/WalletContext";
import { isPlayground } from "@waveshq/walletkit-core";
import { tailwind } from "@tailwind";
import { WalletAddressIndexPersistence } from "@api/wallet/address_index";
import { PlaygroundOperations } from "@screens/PlaygroundNavigator/sections/PlaygroundOperations";
import { MnemonicEncrypted, MnemonicUnprotected } from "@api/wallet";
import { PlaygroundConnection } from "./sections/PlaygroundConnection";
import { PlaygroundToken } from "./sections/PlaygroundToken";
import { PlaygroundUTXO } from "./sections/PlaygroundUTXO";
import { PlaygroundWallet } from "./sections/PlaygroundWallet";
import { PlaygroundStatusInfo } from "./sections/PlaygroundStatusInfo";

export function PlaygroundScreen(): JSX.Element {
  return (
    <ThemedScrollViewV2
      contentInsetAdjustmentBehavior="always"
      style={tailwind("pb-28 px-5")}
    >
      <PlaygroundConnection />
      <PlaygroundStatusInfo />
      <PlaygroundWallet />
      <PlaygroundWalletSection />
    </ThemedScrollViewV2>
  );
}

/**
 * @deprecated need to refactor this as it should never have a 2 `WalletProvider`,
 * however, it should be is a single wallet Provider nested properly
 */
function PlaygroundWalletSection(): JSX.Element | null {
  const { wallets } = useWalletPersistenceContext();
  const { network } = useNetworkContext();

  if (wallets.length === 0 || !isPlayground(network)) {
    return null;
  }

  return (
    <WalletNodeProvider
      data={wallets[0]}
      MnemonicUnprotected={MnemonicUnprotected}
      MnemonicEncrypted={MnemonicEncrypted}
    >
      <WalletContextProvider api={WalletAddressIndexPersistence}>
        <PlaygroundOperations />
        <PlaygroundUTXO />
        <PlaygroundToken />
      </WalletContextProvider>
    </WalletNodeProvider>
  );
}
