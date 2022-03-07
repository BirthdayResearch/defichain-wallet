import { LoanVaultState, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchVaults, vaultsSelector } from '@store/loans'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTokenPrice } from './TokenPrice'

export function useTokenLockedBalance ({ symbol }: { symbol: string }): BigNumber {
  const { getTokenPrice } = useTokenPrice()
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)

  useEffect(() => {
    dispatch(fetchVaults({ client, address }))
  }, [address, blockCount])

  const totalLockedAmount = useMemo(() => {
    return vaults.reduce((totalLockedAmount, vault) => {
      if (vault.state === LoanVaultState.IN_LIQUIDATION) {
        return totalLockedAmount
      }
      const totalCollateralTokenAmount: BigNumber = vault.collateralAmounts.reduce(
        (totalCollateralTokenAmount: BigNumber, token: LoanVaultTokenAmount) => {
          if (token.symbol !== symbol) {
            return totalCollateralTokenAmount.plus(0)
          }

          return totalCollateralTokenAmount.plus(token.amount)
        }, new BigNumber(0))

      return totalLockedAmount.plus(totalCollateralTokenAmount.isNaN() ? 0 : totalCollateralTokenAmount)
    }, new BigNumber(0))
  }, [getTokenPrice, vaults])

  return totalLockedAmount
}

interface TokenBreakdownPercentage {
  availablePercentage: BigNumber
  lockedPercentage: BigNumber
}

export function useTokenBreakdownPercentage ({ available, locked }: { available: BigNumber, locked: BigNumber }): TokenBreakdownPercentage {
  const availablePercentage = available.dividedBy(available.plus(locked)).multipliedBy(100)
  const lockedPercentage = locked.dividedBy(available.plus(locked)).multipliedBy(100)
  return {
    availablePercentage: availablePercentage.isNaN() ? new BigNumber(0) : availablePercentage,
    lockedPercentage: lockedPercentage.isNaN() ? new BigNumber(0) : lockedPercentage
  }
}
