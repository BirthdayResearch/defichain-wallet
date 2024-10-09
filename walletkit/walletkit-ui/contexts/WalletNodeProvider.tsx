import {
  WalletHdNode,
  WalletHdNodeProvider,
} from "@defichain/jellyfish-wallet";
import {
  EncryptedHdNodeProvider,
  EncryptedProviderData,
  PromptPassphrase,
} from "@defichain/jellyfish-wallet-encrypted";
import {
  MnemonicHdNodeProvider,
  MnemonicProviderData,
} from "@defichain/jellyfish-wallet-mnemonic";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { useNetworkContext } from "./NetworkContext";
import { WalletPersistenceDataI, WalletType } from "./WalletPersistenceContext";

export interface PromptInterface {
  prompt: PromptPassphrase;
}

export interface EncryptedMnemonicWalletI {
  initProvider: (
    data: WalletPersistenceDataI<EncryptedProviderData>,
    network: EnvironmentNetwork,
    promptInterface: PromptInterface,
  ) => EncryptedHdNodeProvider;
  toData: (
    mnemonic: string[],
    network: EnvironmentNetwork,
    passphrase: string,
  ) => Promise<WalletPersistenceDataI<EncryptedProviderData>>;
  generateWords?: () => string[];
}

export interface UnencryptedMnemonicWalletI {
  initProvider: (
    data: WalletPersistenceDataI<MnemonicProviderData>,
    network: EnvironmentNetwork,
  ) => MnemonicHdNodeProvider;
  toData: (
    mnemonic: string[],
    network: EnvironmentNetwork,
  ) => WalletPersistenceDataI<MnemonicProviderData>;
  generateWords?: () => string[];
}

interface WalletNodeContextI {
  provider: WalletHdNodeProvider<WalletHdNode>;
  /**
   * Raw WalletPersistenceDataI that is included in WalletHdNodeProvider<WalletHdNode>
   * No risk of including it in context as it's part of the provider.
   */
  data: WalletPersistenceDataI<any>;
}

const WalletNodeContext = createContext<WalletNodeContextI>(undefined as any);

function MnemonicUnprotectedProvider(
  props: WalletNodeProviderProps<MnemonicProviderData>,
): JSX.Element | null {
  const { MnemonicUnprotected, children, data } = props;
  const { network } = useNetworkContext();

  const provider = useMemo(
    () => MnemonicUnprotected.initProvider(data, network),
    [network, data],
  );

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <WalletNodeContext.Provider value={{ provider, data }}>
      {children}
    </WalletNodeContext.Provider>
  );
}

function MnemonicEncryptedProvider(
  props: WalletNodeProviderProps<EncryptedProviderData>,
): JSX.Element | null {
  const { MnemonicEncrypted, children, data } = props;
  const { network } = useNetworkContext();

  const provider = useMemo(
    () =>
      MnemonicEncrypted.initProvider(data, network, {
        /**
         * wallet context only use for READ purpose (non signing)
         * see {@link TransactionAuthorization} for signing implementation
         */
        async prompt() {
          throw new Error("No UI attached for passphrase prompting");
        },
      }),
    [network, data],
  );

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <WalletNodeContext.Provider value={{ provider, data }}>
      {children}
    </WalletNodeContext.Provider>
  );
}

export function useWalletNodeContext(): WalletNodeContextI {
  return useContext(WalletNodeContext);
}

interface WalletNodeProviderProps<T> extends PropsWithChildren<any> {
  data: WalletPersistenceDataI<T>;

  // eslint-disable-next-line react/no-unused-prop-types
  MnemonicEncrypted: EncryptedMnemonicWalletI;

  // eslint-disable-next-line react/no-unused-prop-types
  MnemonicUnprotected: UnencryptedMnemonicWalletI;
}

/**
 * Automatically determine the correct WalletProvider to use based on the wallet type.
 */
export function WalletNodeProvider(
  props: WalletNodeProviderProps<any>,
): JSX.Element | null {
  const { data, children } = props;
  if (data.type === WalletType.MNEMONIC_UNPROTECTED) {
    return (
      <MnemonicUnprotectedProvider {...props}>
        {children}
      </MnemonicUnprotectedProvider>
    );
  }

  if (data.type === WalletType.MNEMONIC_ENCRYPTED) {
    return (
      <MnemonicEncryptedProvider {...props}>
        {children}
      </MnemonicEncryptedProvider>
    );
  }

  throw new Error(`wallet type: ${data.type as string} not available`);
}
