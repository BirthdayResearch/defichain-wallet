import { PropsWithChildren, useMemo } from "react";
import { Provider } from "react-redux";
import { initializeStore } from "@store";
import { useWalletPersistenceContext } from "@waveshq/walletkit-ui";

/**
 * Store that is memoized to network & wallets setting.
 */
export function StoreProvider(props: PropsWithChildren<any>): JSX.Element {
  useWalletPersistenceContext();

  const store = useMemo(() => {
    return initializeStore();
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
}
