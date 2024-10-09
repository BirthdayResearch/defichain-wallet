import { GetFutureInfo } from "@defichain/jellyfish-api-core/dist/category/account";

import {
  fetchExecutionBlock,
  fetchFutureSwaps,
  futureSwaps,
  FutureSwapState,
} from "./futureSwap";

describe("futureSwap reducer", () => {
  let initialState: FutureSwapState;

  beforeEach(() => {
    initialState = {
      futureSwaps: [],
      executionBlock: 0,
    };
  });

  it("should handle initial state", () => {
    expect(futureSwaps.reducer(undefined, { type: "unknown" })).toEqual({
      futureSwaps: [],
      executionBlock: 0,
    });
  });

  it("should handle fetchExecutionBlock", () => {
    const action = { type: fetchExecutionBlock.fulfilled, payload: 10 };
    const actual = futureSwaps.reducer(initialState, action);
    expect(actual.executionBlock).toStrictEqual(10);
  });

  it("should handle fetchFutureSwaps", () => {
    const getFutureInfo: GetFutureInfo = {
      owner: "bcrt1qgnmfwckutkvekgulky92r3csyct0z064yvjax5",
      values: [
        {
          source: "tf1qn0jv4xh60ryx4wyq8wvf0w30f77gqx3f3etyvt",
          destination: "tf1qn0jv4xh60ryx4wyq8wvf0w30f77gqx3f3etyvt",
        },
        {
          source: "tf1qn0jv4xh60ryx4wyq8wvf0w30f77gqx3f3etyvt",
          destination: "tf1qn0jv4xh60ryx4wyq8wvf0w30f77gqx3f3etyvt",
        },
      ],
    };

    const action = { type: fetchFutureSwaps.fulfilled, payload: getFutureInfo };
    const actual = futureSwaps.reducer(initialState, action);
    expect(actual.futureSwaps).toStrictEqual(getFutureInfo.values);
  });
});
