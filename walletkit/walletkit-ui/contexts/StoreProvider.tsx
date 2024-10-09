import { EnhancedStore } from "@reduxjs/toolkit";
import React, { PropsWithChildren, useMemo } from "react";
import { Provider } from "react-redux";

import { useWalletPersistenceContext } from "./WalletPersistenceContext";

interface IStoreProvider {
  initializeStore: () => EnhancedStore;
}

export function StoreProvider(
  props: PropsWithChildren<IStoreProvider>,
): JSX.Element {
  const { children, initializeStore } = props;
  const { wallets } = useWalletPersistenceContext();

  const store = useMemo(() => initializeStore(), [wallets]);

  return <Provider store={store}>{children}</Provider>;
}
