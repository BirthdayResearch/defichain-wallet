import { useSelector } from 'react-redux'
import { RootState } from '@store'

export function useAddressLabel (address: string): string | null {
  const addresses = useSelector((state: RootState) => state.userPreferences?.addresses)
  let label = null
  if (addresses?.[address] != null) {
    label = addresses[address].label
  }
  return label !== '' ? label : null
}
