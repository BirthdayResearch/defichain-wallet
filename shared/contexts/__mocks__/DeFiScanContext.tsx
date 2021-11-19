export const useDeFiScanContext = (): { getBlocksUrl: Function, getAddressUrl: Function, getVaultsUrl: Function } => {
  return {
    getBlocksUrl: jest.fn,
    getAddressUrl: jest.fn,
    getVaultsUrl: jest.fn
  }
}
