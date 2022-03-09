import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchVaults, vaultsSelector } from '@store/loans'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

interface TokenLockedBalance {
  [key: string]: BigNumber
}

export function useTokenLockedBalance ({ symbol }: { symbol?: string }): BigNumber {
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const [totalLockedBalance, setTotalLockedBalance] = useState<TokenLockedBalance>({})
  const [sumOfLockedBalance, setSumOfLockedBalance] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    dispatch(fetchVaults({ client, address }))
  }, [address, blockCount])

  useEffect(() => {
    setTotalLockedBalance(computeLockedAmount())
    setSumOfLockedBalance(computeSumOfLockedBalance())
  }, [vaults])

  const computeLockedAmount = useCallback(() => {
    const totalLockedBalance: TokenLockedBalance = {}

    vaults.forEach(vault => {
      if (vault.state === LoanVaultState.IN_LIQUIDATION) {
        return
      }

      vault.collateralAmounts.forEach(collateral => {
        const tokenExist = totalLockedBalance[collateral.symbol]
        if (tokenExist !== undefined) {
          totalLockedBalance[collateral.symbol] = totalLockedBalance[collateral.symbol].plus(collateral.amount)
        } else {
          totalLockedBalance[collateral.symbol] = new BigNumber(collateral.amount)
        }
      })
    })

    return totalLockedBalance
  }, [vaults])

  const computeSumOfLockedBalance = (): BigNumber => Object.keys(totalLockedBalance).reduce((sum, token) => {
    return sum.plus(totalLockedBalance[token])
  }, new BigNumber(0))

  return symbol === undefined ? sumOfLockedBalance : totalLockedBalance[symbol] ?? new BigNumber(0)
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
