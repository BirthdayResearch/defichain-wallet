export const useDeFiScanContext = (): { getBlocksUrl: Function, getAddressUrl: Function } => {
  return {
    getBlocksUrl: jest.fn,
    getAddressUrl: jest.fn
  }
}
