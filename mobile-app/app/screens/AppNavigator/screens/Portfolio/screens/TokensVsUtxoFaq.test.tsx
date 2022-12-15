import { render } from "@testing-library/react-native";
import { TokensVsUtxoFaq } from "./TokensVsUtxoFaq";

describe("Tokens vs Utxo FAQ screen", () => {
  it("should match snapshot", async () => {
    const rendered = render(<TokensVsUtxoFaq />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
