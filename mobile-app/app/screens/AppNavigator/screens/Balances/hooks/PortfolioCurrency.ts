import { PortfolioCurrencyPersistence } from '@api/persistence/portfolio_currency_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useEffect, useState } from 'react'
import { PortfolioButtonGroupTabKey } from '../components/TotalPortfolio'

interface PortfolioCurrency {
    portfolioCurrency: PortfolioButtonGroupTabKey
    setPortfolioCurrency: (val: PortfolioButtonGroupTabKey) => void
}

export function usePortfolioCurrency (): PortfolioCurrency {
    const logger = useLogger()
    const [portfolioCurrency, setPortfolioCurrency] = useState<PortfolioButtonGroupTabKey>(PortfolioButtonGroupTabKey.USD)

    useEffect(() => {
        PortfolioCurrencyPersistence.get().then((currencyVal) => {
            setPortfolioCurrency(currencyVal)
        }).catch(logger.error)
    }, [])

    const updatePortfolioCurrency = async (currencyVal: PortfolioButtonGroupTabKey): Promise<void> => {
        setPortfolioCurrency(currencyVal)
        await PortfolioCurrencyPersistence.set(currencyVal)
    }

    return {
        portfolioCurrency,
        setPortfolioCurrency: updatePortfolioCurrency
    }
}
