import { getPaginatedResponse } from "./paginatedAPI";

describe("Paginated API", () => {
  it("should receive correct value", async () => {
    const sampleData = [{ name: "John" }];
    const mockAPI = jest.fn().mockResolvedValue(sampleData);
    const response = await getPaginatedResponse((limit, next) =>
      mockAPI(limit, next),
    );
    expect(response).toEqual(sampleData);
  });
});
