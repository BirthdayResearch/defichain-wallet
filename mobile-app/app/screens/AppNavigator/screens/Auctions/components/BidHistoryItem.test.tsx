import { render } from "@testing-library/react-native";
import BigNumber from "bignumber.js";
import { BidHistoryItem } from "./BidHistoryItem";

jest.mock("@shared-contexts/WalletContext");
jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

jest.mock("../hooks/BidTimeAgo", () => ({
  useBidTimeAgo: () => "3Hr 12Min",
}));

describe("Empty bids", () => {
  it("should match snapshot", async () => {
    const rendered = render(
      <BidHistoryItem
        bidIndex={0}
        bidAmount="1000"
        loanDisplaySymbol="dTD10"
        bidderAddress="00142fc8acc2c16d917d5e26180b8ac11f0f9fbe858a"
        bidAmountInUSD={new BigNumber("7.4")}
        bidBlockTime={1664167263}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
