import { DeFiChainStubContainer } from "./DeFiChainStubContainer";

describe("testcontainers initialize", () => {
  it("should initialize containers", async () => {
    const container = new DeFiChainStubContainer();
    expect(container instanceof DeFiChainStubContainer).toBe(true);
  });
});
