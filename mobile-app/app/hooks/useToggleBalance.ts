import { useEffect, useState } from 'react'
import { ToggleBalancesPersistence } from '@api/persistence/toggle_balances_storage'

const HIDDEN_BALANCE_TEXT = '*****'

interface ToggleBalanceProps {
  isBalancesDisplayed: boolean
  hiddenBalanceText: string
  toggleBalance: () => Promise<void>
}

export function useToggleBalance (): ToggleBalanceProps {
  const [isBalancesDisplayed, setIsBalancesDisplayed] = useState(false)

  const toggleBalance = async (): Promise<void> => {
    setIsBalancesDisplayed(!isBalancesDisplayed)
    await ToggleBalancesPersistence.set(!isBalancesDisplayed)
  }

  useEffect(() => {
    void (async () => {
      setIsBalancesDisplayed(await ToggleBalancesPersistence.get())
    })()
  }, [])

  return { isBalancesDisplayed, hiddenBalanceText: HIDDEN_BALANCE_TEXT, toggleBalance }
}
