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
    const [denominationCurrency, setDenominationCurrency] = useState<PortfolioButtonGroupTabKey>(PortfolioButtonGroupTabKey.USD)

    useEffect(() => {
        PortfolioCurrencyPersistence.get().then((currencyVal) => {
            setDenominationCurrency(currencyVal)
        }).catch(logger.error)
    }, [])

    const updatePortfolioCurrency = async (currencyVal: PortfolioButtonGroupTabKey): Promise<void> => {
        setDenominationCurrency(currencyVal)
        await PortfolioCurrencyPersistence.set(currencyVal)
    }

    return {
        denominationCurrency,
        setDenominationCurrency: updatePortfolioCurrency
    }
}
