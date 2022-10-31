import { WalletContextProvider } from "@shared-contexts/WalletContext";
import { WalletNodeProvider } from "@shared-contexts/WalletNodeProvider";
import { useWalletPersistenceContext } from "@shared-contexts/WalletPersistenceContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { WalletAddressIndexPersistence } from "@api/wallet/address_index";
import { WalletDataProvider } from "@shared-contexts/WalletDataProvider";
import { I18nextProvider, useTranslation } from "react-i18next";
import { AppNavigator } from "./AppNavigator/AppNavigator";
import { PrivacyLock } from "./PrivacyLock";
import { TransactionAuthorization } from "./TransactionAuthorization/TransactionAuthorization";
import { WalletNavigator } from "./WalletNavigator/WalletNavigator";

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator(): JSX.Element {
  const { wallets, isLoaded } = useWalletPersistenceContext();
  const { i18n } = useTranslation();

  // To prevent flicker on start of app, while API is not yet called
  if (!isLoaded) {
    return <></>;
  }

  if (wallets.length === 0) {
    return <WalletNavigator />;
  }

  return (
    <WalletNodeProvider data={wallets[0]}>
      <WalletContextProvider api={WalletAddressIndexPersistence}>
        <WalletDataProvider>
          <PrivacyLock />
          <BottomSheetModalProvider>
            <TransactionAuthorization />
            <I18nextProvider i18n={i18n}>
              <AppNavigator />
            </I18nextProvider>
          </BottomSheetModalProvider>
        </WalletDataProvider>
      </WalletContextProvider>
    </WalletNodeProvider>
  );
}
