import { PortfolioCurrencyPersistence } from "@api/persistence/portfolio_currency_storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useEffect, useState } from "react";
import { PortfolioButtonGroupTabKey } from "../components/TotalPortfolio";

interface PortfolioCurrency {
  denominationCurrency: PortfolioButtonGroupTabKey;
  setDenominationCurrency: (val: PortfolioButtonGroupTabKey) => void;
}

export function useDenominationCurrency(): PortfolioCurrency {
  const logger = useLogger();
  const [denominationCurrency, setDenominationCurrency] =
    useState<PortfolioButtonGroupTabKey>(PortfolioButtonGroupTabKey.USDC);

  useEffect(() => {
    PortfolioCurrencyPersistence.get()
      .then((denomination: PortfolioButtonGroupTabKey) => {
        // Change the local storage USDT to USDC
        setDenominationCurrency(
          denomination === PortfolioButtonGroupTabKey.USDT
            ? PortfolioButtonGroupTabKey.USDC
            : denomination,
        );
      })
      .catch(logger.error);
  }, []);

  const updatePortfolioCurrency = async (
    denomination: PortfolioButtonGroupTabKey,
  ): Promise<void> => {
    setDenominationCurrency(denomination);
    await PortfolioCurrencyPersistence.set(denomination);
  };

  return {
    denominationCurrency,
    setDenominationCurrency: updatePortfolioCurrency,
  };
}
