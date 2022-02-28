import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
import { VaultCard } from '@screens/AppNavigator/screens/Loans/components/VaultCard'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useEffect } from 'react'
import { fetchCollateralTokens, fetchVaults, vaultsSelector } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useIsFocused } from '@react-navigation/native'

export function Vaults (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const isFocused = useIsFocused()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchVaults({ address, client }))
    }
  }, [blockCount, address, isFocused])

  useEffect(() => {
    dispatch(fetchCollateralTokens({ client }))
  }, [])

  return (
    <ThemedScrollView contentContainerStyle={tailwind('p-4 pb-8')}>
      {vaults.map((vault, index) => {
        return <VaultCard testID={`vault_card_${index}`} key={index} vault={vault} />
      })}
    </ThemedScrollView>
  )
}
