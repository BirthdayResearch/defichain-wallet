import { SummaryTitleV2 } from "@components/SummaryTitleV2";
import BigNumber from "bignumber.js";
import { render } from "@testing-library/react-native";

jest.mock("@shared-contexts/ThemeProvider");

describe("Summary Title V2", () => {
  it("should match snapshot", async () => {
    const renderer = render(
      <SummaryTitleV2
        title="foo"
        testID="testID"
        amount={new BigNumber(0.123456789)}
        fromAddress="fromAddress"
        toAddress="toAddress"
        iconA="_UTXO"
        iconB="BTC"
      />
    );
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
