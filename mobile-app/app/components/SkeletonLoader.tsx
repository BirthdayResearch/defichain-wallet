import { VaultSchemesSkeletonLoaderV2 } from "@components/skeletonLoaders/VaultSchemeSkeletonLoaderV2";
import { DexSkeletonLoader } from "./skeletonLoaders/DexSkeletonLoader";
import { MnemonicWordSkeletonLoader } from "./skeletonLoaders/MnemonicWordSkeletonLoader";
import { TransactionSkeletonLoader } from "./skeletonLoaders/TransactionSkeletonLoader";
import { LoanSkeletonLoader } from "./skeletonLoaders/LoanSkeletonLoader";
import { LoanSkeletonLoaderV2 } from "./skeletonLoaders/LoanSkeletonLoaderV2";
import { AddressSkeletonLoader } from "./skeletonLoaders/AddressSkeletonLoader";
import { BrowseAuctionsLoader } from "./skeletonLoaders/BrowseAuctionsLoader";
import { VaultSkeletonLoader } from "./skeletonLoaders/VaultSkeletonLoader";
import { PortfolioSkeletonLoader } from "./skeletonLoaders/PortfolioSkeletonLoader";
import { DexPricesSkeletonLoader } from "./skeletonLoaders/DexPricesSkeletonLoader";
import { MnemonicWordSkeletonLoaderV2 } from "./skeletonLoaders/MnemonicWordSkeletonLoaderV2";
import { TokenSelectionLoader } from "./skeletonLoaders/TokenSelectionLoader";

interface SkeletonLoaderProp {
  row: number;
  screen: SkeletonLoaderScreen;
}

export enum SkeletonLoaderScreen {
  "Dex" = "Dex",
  "DexPrices" = "DexPrices",
  "Transaction" = "Transaction",
  "MnemonicWord" = "MnemonicWord",
  "MnemonicWordV2" = "MnemonicWordV2",
  "Loan" = "Loan",
  "LoanV2" = "LoanV2",
  "Address" = "Address",
  "BrowseAuction" = "BrowseAuction",
  "Vault" = "Vault",
  "Portfolio" = "Portfolio",
  "VaultSchemes" = "VaultSchemes",
  "TokenSelection" = "TokenSelection",
}

export function SkeletonLoader(prop: SkeletonLoaderProp): JSX.Element {
  const skeletonRow = Array.from(Array(prop.row), (_v, i) => i + 1);
  switch (prop.screen) {
    case SkeletonLoaderScreen.Dex:
      return (
        <>
          {skeletonRow.map((i) => (
            <DexSkeletonLoader key={i} />
          ))}
        </>
      );

    case SkeletonLoaderScreen.DexPrices:
      return (
        <>
          {skeletonRow.map((i) => (
            <DexPricesSkeletonLoader key={i} />
          ))}
        </>
      );

    case SkeletonLoaderScreen.Transaction:
      return (
        <>
          {skeletonRow.map((i) => (
            <TransactionSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.MnemonicWord:
      return (
        <>
          {skeletonRow.map((i) => (
            <MnemonicWordSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.MnemonicWordV2:
      return (
        <>
          {skeletonRow.map((i, index) => (
            <MnemonicWordSkeletonLoaderV2
              key={i}
              border={index < skeletonRow.length - 1}
            />
          ))}
        </>
      );
    case SkeletonLoaderScreen.Loan:
      return (
        <>
          {skeletonRow.map((i) => (
            <LoanSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.LoanV2:
      return (
        <>
          {skeletonRow.map((i) => (
            <LoanSkeletonLoaderV2 key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.Address:
      return (
        <>
          {skeletonRow.map((i) => (
            <AddressSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.BrowseAuction:
      return (
        <>
          {skeletonRow.map((i) => (
            <BrowseAuctionsLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.Vault:
      return (
        <>
          {skeletonRow.map((i) => (
            <VaultSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.TokenSelection:
      return (
        <>
          {skeletonRow.map((i) => (
            <TokenSelectionLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.Portfolio:
      return (
        <>
          {skeletonRow.map((i) => (
            <PortfolioSkeletonLoader key={i} />
          ))}
        </>
      );
    case SkeletonLoaderScreen.VaultSchemes:
      return (
        <>
          {skeletonRow.map((i, index) => (
            <VaultSchemesSkeletonLoaderV2
              key={i}
              last={index === skeletonRow.length - 1}
            />
          ))}
        </>
      );
  }
}
