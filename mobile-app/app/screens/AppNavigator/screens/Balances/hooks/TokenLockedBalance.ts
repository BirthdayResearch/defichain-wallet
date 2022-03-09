import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchVaults, vaultsSelector } from '@store/loans'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTokenPrice } from './TokenPrice'

interface TokenLockedBalance {
  [key: string]: LockedBalance
}

interface LockedBalance {
  /**
   * total portfolio value will not return amount
   */
  amount?: BigNumber
  usdValue: BigNumber
}

/**
 *
 * @param symbol optional token symbol
 * @returns total portfolio value in USD when `symbol` is not passed. Otherwise, amount of token and usd value of locked token
 */
export function useTokenLockedBalance ({ symbol }: { symbol?: string }): LockedBalance {
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const [totalLockedBalance, setTotalLockedBalance] = useState<TokenLockedBalance>({})
  const [sumOfLockedBalance, setSumOfLockedBalance] = useState<LockedBalance>({ usdValue: new BigNumber(0) })
  const { getTokenPrice } = useTokenPrice()

  useEffect(() => {
    dispatch(fetchVaults({ client, address }))
  }, [address, blockCount])

  useEffect(() => {
    setTotalLockedBalance(computeLockedAmount())
    setSumOfLockedBalance({
      usdValue: computeSumOfLockedBalance()
    })
  }, [vaults])

  const computeLockedAmount = useCallback(() => {
    const totalLockedBalance: TokenLockedBalance = {}

    vaults.forEach(vault => {
      if (vault.state === LoanVaultState.IN_LIQUIDATION) {
        return
      }

      vault.collateralAmounts.forEach(collateral => {
        const tokenExist = totalLockedBalance[collateral.symbol]
        const TokenUSDValue = getTokenPrice(collateral.symbol, new BigNumber(collateral.amount))
        if (tokenExist !== undefined) {
          totalLockedBalance[collateral.symbol].amount = totalLockedBalance[collateral.symbol].amount?.plus(collateral.amount)
          totalLockedBalance[collateral.symbol].usdValue = totalLockedBalance[collateral.symbol].usdValue.plus(TokenUSDValue)
        } else {
          totalLockedBalance[collateral.symbol] = {
            amount: new BigNumber(collateral.amount),
            usdValue: TokenUSDValue
          }
        }
      })
    })

    return totalLockedBalance
  }, [vaults])

  const computeSumOfLockedBalance = (): BigNumber => Object.keys(totalLockedBalance).reduce((sum, token) => {
    return sum.plus(totalLockedBalance[token].usdValue)
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
