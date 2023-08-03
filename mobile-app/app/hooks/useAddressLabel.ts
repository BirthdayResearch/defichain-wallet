import { useSelector } from "react-redux";
import { RootState } from "@store";
import { selectAllLabeledWalletAddress } from "@store/userPreferences";

export function useAddressLabel(address: string): string | null {
  const addresses = useSelector((state: RootState) =>
    selectAllLabeledWalletAddress(state.userPreferences)
  );
  let label = null;
  if (addresses?.[address] != null) {
    label = addresses[address].label;
  }
  return label !== "" ? label : null;
}
