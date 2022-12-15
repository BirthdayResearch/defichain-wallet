import { render } from "@testing-library/react-native";
import { AuctionTimeProgress } from "./AuctionTimeProgress";

describe("Auction time progress", () => {
  it("should match snapshot", async () => {
    const liquidationHeight = 1100;
    const blockCount = 1000;
    const label = "Auction time remaining";
    const rendered = render(
      <AuctionTimeProgress
        liquidationHeight={liquidationHeight}
        blockCount={blockCount}
        label={label}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
