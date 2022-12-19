import * as SplashScreen from "expo-splash-screen";
import "./_shim";
import {
  SecuredStoreAPI,
  LanguagePersistence,
  ThemePersistence,
  Logging,
} from "@api";
import { AppStateContextProvider } from "@contexts/AppStateContext";
import { DeFiScanProvider } from "@shared-contexts/DeFiScanContext";
import { DisplayBalancesProvider } from "@contexts/DisplayBalancesContext";
import { PrivacyLockContextProvider } from "@contexts/LocalAuthContext";
import {
  LanguageProvider,
  NetworkProvider,
  ThemeProvider,
  useLanguage,
  useTheme,
} from "@waveshq/walletkit-ui";
import { StatsProvider } from "@shared-contexts/StatsProvider";
import { StoreProvider } from "@contexts/StoreProvider";
import { WalletPersistenceProvider } from "@shared-contexts/WalletPersistenceContext";
import { WhaleProvider } from "@shared-contexts/WhaleContext";
import { useCachedResources } from "@hooks/useCachedResources";
import ConnectionBoundary from "@screens/ConnectionBoundary/ConnectionBoundary";
import ErrorBoundary from "@screens/ErrorBoundary/ErrorBoundary";
import { Main } from "@screens/Main";
import * as Localization from "expo-localization";
import { useColorScheme } from "react-native";
import { WalletPersistence } from "@api/wallet";
import {
  NativeLoggingProvider,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { FeatureFlagProvider } from "@contexts/FeatureFlagContext";
import { WalletAddressIndexPersistence } from "@api/wallet/address_index";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { tailwind } from "@tailwind";
import { ToastProvider } from "react-native-toast-notifications";
import { ToastProps } from "react-native-toast-notifications/lib/typescript/toast";
import { WalletToast } from "@components/WalletToast";
import { StoreServiceProvider } from "@contexts/StoreServiceProvider";
import { ServiceProviderPersistence } from "@api/wallet/service_provider";
import { FavouritePoolpairProvider } from "@contexts/FavouritePoolpairContext";
import BigNumber from "bignumber.js";
import i18n from "i18n-js";

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App(): JSX.Element | null {
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

  const isLoaded = useCachedResources();
  const colorScheme = useColorScheme();
  const logger = useLogger();

  const onChangeLocale = (currentLanguage: string) => {
    i18n.locale = currentLanguage;
  };

  const { isThemeLoaded } = useTheme({
    api: ThemePersistence,
    colorScheme,
    logger: Logging,
  });
  const { isLanguageLoaded } = useLanguage({
    api: LanguagePersistence,
    locale: Localization.locale,
    logger: Logging,
    onChangeLocale,
  });

  if (!isLoaded && !isThemeLoaded && !isLanguageLoaded) {
    SplashScreen.preventAutoHideAsync().catch(logger.error);
    return null;
  }

  const customToast = {
    wallet_toast: (toast: ToastProps) => <WalletToast toast={toast} />,
  };

  return (
    <NativeLoggingProvider>
      <ErrorBoundary>
        <AppStateContextProvider>
          <PrivacyLockContextProvider>
            <NetworkProvider api={SecuredStoreAPI} logger={Logging}>
              <StoreServiceProvider api={ServiceProviderPersistence}>
                <WhaleProvider>
                  <DeFiScanProvider>
                    <WalletPersistenceProvider
                      api={{
                        ...WalletPersistence,
                        ...WalletAddressIndexPersistence,
                      }}
                    >
                      <StoreProvider>
                        <StatsProvider>
                          <FeatureFlagProvider>
                            <ThemeProvider
                              api={ThemePersistence}
                              colorScheme={colorScheme}
                              logger={Logging}
                            >
                              <LanguageProvider
                                api={LanguagePersistence}
                                locale={Localization.locale}
                                logger={Logging}
                                onChangeLocale={onChangeLocale}
                              >
                                <DisplayBalancesProvider>
                                  <ConnectionBoundary>
                                    <GestureHandlerRootView
                                      style={tailwind("flex-1")}
                                    >
                                      <ToastProvider renderType={customToast}>
                                        <FavouritePoolpairProvider>
                                          <Main />
                                        </FavouritePoolpairProvider>
                                      </ToastProvider>
                                    </GestureHandlerRootView>
                                  </ConnectionBoundary>
                                </DisplayBalancesProvider>
                              </LanguageProvider>
                            </ThemeProvider>
                          </FeatureFlagProvider>
                        </StatsProvider>
                      </StoreProvider>
                    </WalletPersistenceProvider>
                  </DeFiScanProvider>
                </WhaleProvider>
              </StoreServiceProvider>
            </NetworkProvider>
          </PrivacyLockContextProvider>
        </AppStateContextProvider>
      </ErrorBoundary>
    </NativeLoggingProvider>
  );
}
