import { render } from "@testing-library/react-native";
import { AuctionsFaq } from "./AuctionsFaq";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("Auctions FAQ V2 screen", () => {
  it("should match snapshot", async () => {
    const rendered = render(<AuctionsFaq />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
