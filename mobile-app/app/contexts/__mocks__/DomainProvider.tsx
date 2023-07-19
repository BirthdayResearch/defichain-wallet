export enum DomainType {
  DFI = "DFI",
  EVM = "EVM",
}

export const useDomainContext = () => {
  return {
    domain: "DFI",
  };
};
