import { PortfolioCurrencyPersistence } from '@api/persistence/portfolio_currency_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useEffect, useState } from 'react'
import { PortfolioButtonGroupTabKey } from '../components/TotalPortfolio'

interface PortfolioCurrency {
    denominationCurrency: PortfolioButtonGroupTabKey
    setDenominationCurrency: (val: PortfolioButtonGroupTabKey) => void
}

export function useDenominationCurrency (): PortfolioCurrency {
    const logger = useLogger()
    const [denominationCurrency, setDenominationCurrency] = useState<PortfolioButtonGroupTabKey>(PortfolioButtonGroupTabKey.USDT)

    useEffect(() => {
        PortfolioCurrencyPersistence.get().then((denomination: PortfolioButtonGroupTabKey) => {
            setDenominationCurrency(denomination)
        }).catch(logger.error)
    }, [])

    const updatePortfolioCurrency = async (denomination: PortfolioButtonGroupTabKey): Promise<void> => {
        setDenominationCurrency(denomination)
        await PortfolioCurrencyPersistence.set(denomination)
    }

    return {
        denominationCurrency,
        setDenominationCurrency: updatePortfolioCurrency
    }
}
