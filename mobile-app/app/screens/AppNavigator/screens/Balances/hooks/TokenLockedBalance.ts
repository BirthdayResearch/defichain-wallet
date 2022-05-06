import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { RootState } from '@store'
import { vaultsSelector } from '@store/loans'
import { dexPricesSelectorByDenomination } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { clone } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTokenPrice } from './TokenPrice'

export interface LockedBalance {
  amount: BigNumber
  tokenValue: BigNumber
}

/**
 *
 * @param denominationCurrency currency for the value of locked balance
 * @param displaySymbol optional token displaySymbol
 * @returns `Map` of all tokens' locked balance or single object if displaySymbol is passed
 */
export function useTokenLockedBalance ({ displaySymbol, denominationCurrency }: { displaySymbol?: string, denominationCurrency: string }): Map<string, LockedBalance> | LockedBalance | undefined {
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const [lockedBalance, setLockedBalance] = useState<Map<string, LockedBalance>>()
  const { getTokenPrice } = useTokenPrice(denominationCurrency)
  const prices = useSelector((state: RootState) => dexPricesSelectorByDenomination(state.wallet, denominationCurrency))

  useEffect(() => {
    setLockedBalance(computeLockedAmount())
  }, [vaults, prices])

  const computeLockedAmount = useCallback(() => {
    const lockedBalance = new Map<string, LockedBalance>()

    vaults.forEach(vault => {
      if (vault.state === LoanVaultState.IN_LIQUIDATION) {
        return
      }

      vault.collateralAmounts.forEach(collateral => {
        const token = clone(lockedBalance.get(collateral.displaySymbol)) ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
        const tokenValue = getTokenPrice(collateral.symbol, new BigNumber(collateral.amount))
        lockedBalance.set(collateral.displaySymbol, {
          amount: token.amount.plus(collateral.amount),
          tokenValue: token.tokenValue.plus(tokenValue)
        })
      })
    })

    return lockedBalance
  }, [vaults, prices])

  return displaySymbol === undefined ? lockedBalance : lockedBalance?.get(displaySymbol)
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
