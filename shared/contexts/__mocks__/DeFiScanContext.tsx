export const useDeFiScanContext = (): { getBlocksUrl: Function } => {
  return {
    getBlocksUrl: jest.fn
  }
}
