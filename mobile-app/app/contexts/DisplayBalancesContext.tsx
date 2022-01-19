import { createContext, useContext, useEffect, useState } from 'react'
import * as React from 'react'
import { DisplayBalancesPersistence } from '@api'
import { useLogger } from '../../../shared/contexts/NativeLoggingProvider'

const HIDDEN_BALANCE_TEXT = '*****'

interface DisplayBalancesProps {
  isBalancesDisplayed: boolean
  hiddenBalanceText: string
  toggleDisplayBalances: () => Promise<void>
}

const DisplayBalancesContext = createContext<DisplayBalancesProps>(undefined as any)

/**
 * DisplayBalancesContext Context wrapped within <DisplayBalancesProvider>
 *
 * This context enables display/hide of balances management across the app
 */

export function useDisplayBalancesContext (): DisplayBalancesProps {
  return useContext(DisplayBalancesContext)
}

export function DisplayBalancesProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const logger = useLogger()
  const [isBalancesDisplayed, setIsBalancesDisplayed] = useState<boolean>(true)
  const toggleDisplayBalances = async (): Promise<void> => {
    setIsBalancesDisplayed(!isBalancesDisplayed)
    await DisplayBalancesPersistence.set(!isBalancesDisplayed).catch((err) => logger.error(err))
  }
  const context: DisplayBalancesProps = {
    hiddenBalanceText: HIDDEN_BALANCE_TEXT, isBalancesDisplayed, toggleDisplayBalances
  }

  useEffect(() => {
    DisplayBalancesPersistence.get().then((b) => {
      setIsBalancesDisplayed(b)
    }).catch(logger.error)
  }, [])

  return (
    <DisplayBalancesContext.Provider value={context}>
      {props.children}
    </DisplayBalancesContext.Provider>
  )
}
