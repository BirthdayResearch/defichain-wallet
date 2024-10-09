import { ApiPagedResponse } from "@defichain/whale-api-client";

export async function getPaginatedResponse<T>(
  api: (limit: number, next?: string) => Promise<ApiPagedResponse<T>>,
): Promise<T[]> {
  const current = [];
  let hasNext = false;
  let next;

  try {
    do {
      // eslint-disable-next-line no-await-in-loop
      const data: ApiPagedResponse<T> = await api(200, next);
      current.push(...data);
      hasNext = data.hasNext;
      next = data.nextToken;
    } while (hasNext);
  } catch (e) {
    return current;
  }
  return current;
}
