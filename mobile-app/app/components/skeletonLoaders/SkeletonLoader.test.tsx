import { render } from "@testing-library/react-native";
import { DexSkeletonLoader } from "./DexSkeletonLoader";
import { MnemonicWordSkeletonLoader } from "./MnemonicWordSkeletonLoader";
import { TransactionSkeletonLoader } from "./TransactionSkeletonLoader";
import { LoanSkeletonLoader } from "./LoanSkeletonLoader";
import { AddressSkeletonLoader } from "./AddressSkeletonLoader";
import { BrowseAuctionsLoader } from "./BrowseAuctionsLoader";
import { VaultSkeletonLoader } from "./VaultSkeletonLoader";
import { VaultSchemesSkeletonLoader } from "./VaultSchemeSkeletonLoader";
import { DexPricesSkeletonLoader } from "./DexPricesSkeletonLoader";
import { MnemonicWordSkeletonLoaderV2 } from "./MnemonicWordSkeletonLoaderV2";
import { PortfolioSkeletonLoader } from "./PortfolioSkeletonLoader";

describe("Skeleton Loader", () => {
  it("should match snapshot of dex skeleton loader", async () => {
    const component = <DexSkeletonLoader uniqueKey="dex" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of dex price skeleton loader", async () => {
    const component = <DexPricesSkeletonLoader uniqueKey="dexPrice" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of transaction skeleton loader", async () => {
    const component = <TransactionSkeletonLoader uniqueKey="transaction" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of mnemonic word skeleton loader", async () => {
    const component = <MnemonicWordSkeletonLoader uniqueKey="mnemonic_word" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of mnemonic word skeleton loader v2", async () => {
    const component = (
      <MnemonicWordSkeletonLoaderV2 uniqueKey="mnemonic_word_v2" border />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of loan skeleton loader", async () => {
    const component = <LoanSkeletonLoader uniqueKey="loan" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of address skeleton loader", async () => {
    const component = <AddressSkeletonLoader uniqueKey="address" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of browse auction skeleton loader", async () => {
    const component = <BrowseAuctionsLoader uniqueKey="browseAuctions" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of vault skeleton loader", async () => {
    const component = <VaultSkeletonLoader uniqueKey="vault" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of vault scheme skeleton loader", async () => {
    const component = (
      <VaultSchemesSkeletonLoader uniqueKey="vault_scheme" last={false} />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of portfolio skeleton loader", async () => {
    const component = <PortfolioSkeletonLoader uniqueKey="portfolio_scheme" />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
