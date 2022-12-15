import { render } from "@testing-library/react-native";
import BigNumber from "bignumber.js";
import { TokenBreakdownDetails } from "./TokenBreakdownDetails";
import { PortfolioButtonGroupTabKey } from "./TotalPortfolio";

jest.mock("../../../../../contexts/DisplayBalancesContext");

describe("Token Breakdown Details", () => {
  it("should match snapshot", async () => {
    const component = (
      <TokenBreakdownDetails
        hasFetchedToken
        lockedAmount={new BigNumber("1")}
        lockedValue={new BigNumber("123")}
        availableAmount={new BigNumber("99")}
        availableValue={new BigNumber("999999.12345678")}
        testID="foo"
        denominationCurrency={PortfolioButtonGroupTabKey.USDT}
      />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
