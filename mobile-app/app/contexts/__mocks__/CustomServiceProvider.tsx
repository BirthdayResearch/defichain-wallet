export const useCustomServiceProviderContext = () => {
  return {
    evmUrl: "",
    ethRpcUrl: "",
    isCustomEvmUrl: false,
    isCustomEthRpcUrl: false,
    defaultEvmUrl: "",
    defaultEthRpcUrl: "",
    setCustomUrl: jest.fn(),
  };
};
