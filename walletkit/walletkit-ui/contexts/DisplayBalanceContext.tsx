import React, { createContext, useContext, useEffect, useState } from "react";

import { BaseLogger } from "./logger";

const HIDDEN_BALANCE_TEXT = "*****";

interface DisplayBalancesProps {
  isBalancesDisplayed: boolean;
  hiddenBalanceText: string;
  toggleDisplayBalances: () => Promise<void>;
}

const DisplayBalancesContext = createContext<DisplayBalancesProps>(
  undefined as any,
);

/**
 * DisplayBalancesContext Context wrapped within <DisplayBalancesProvider>
 *
 * This context enables display/hide of balances management across the app
 */

export function useDisplayBalancesContext(): DisplayBalancesProps {
  return useContext(DisplayBalancesContext);
}

interface DisplayBalancesPersistenceProps {
  set(isBalancesDisplayed: boolean): Promise<void>;
  get(): Promise<boolean>;
}

interface DisplayBalancesProviderProps {
  logger: BaseLogger;
  DisplayBalancesPersistence: DisplayBalancesPersistenceProps;
}

export function DisplayBalancesProvider(
  props: React.PropsWithChildren<DisplayBalancesProviderProps>,
): JSX.Element | null {
  const { logger, DisplayBalancesPersistence, children } = props;
  const [isBalancesDisplayed, setIsBalancesDisplayed] = useState<boolean>(true);
  const toggleDisplayBalances = async (): Promise<void> => {
    setIsBalancesDisplayed(!isBalancesDisplayed);
    await DisplayBalancesPersistence.set(!isBalancesDisplayed).catch((err) =>
      logger.error(err),
    );
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context: DisplayBalancesProps = {
    hiddenBalanceText: HIDDEN_BALANCE_TEXT,
    isBalancesDisplayed,
    toggleDisplayBalances,
  };

  useEffect(() => {
    DisplayBalancesPersistence.get()
      .then((b) => {
        setIsBalancesDisplayed(b);
      })
      .catch(logger.error);
  }, []);

  return (
    <DisplayBalancesContext.Provider value={context}>
      {children}
    </DisplayBalancesContext.Provider>
  );
}
