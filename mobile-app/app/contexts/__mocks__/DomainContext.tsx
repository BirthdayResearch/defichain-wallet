export enum DomainType {
  DVM = "DVM",
  EVM = "EVM",
}

export const useDomainContext = () => {
  return {
    domain: "DVM",
  };
};
