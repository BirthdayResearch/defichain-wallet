import { useStyles } from "@tailwind";
import { render } from "@testing-library/react-native";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "./themed";
import { TransactionCard } from "./TransactionCard";

jest.mock("@shared-contexts/ThemeProvider");

describe.skip("Transaction Card", () => {
  it("should match snapshot", async () => {
    const { tailwind } = useStyles();
    const rendered = render(
      <TransactionCard maxValue={new BigNumber(100)} onChange={() => {}}>
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("flex flex-row items-center border-b-0.5 pb-2")}
        >
          <ThemedTextV2>{translate("", "Sample Text")}</ThemedTextV2>
        </ThemedViewV2>
      </TransactionCard>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
