import AsyncStorage from '@react-native-async-storage/async-storage'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Balances/components/TotalPortfolio'

const KEY = 'WALLET.PORTFOLIO_CURRENCY'

async function set (portfolioCurrency: PortfolioButtonGroupTabKey): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(portfolioCurrency))
}

async function get (): Promise<PortfolioButtonGroupTabKey> {
    const val = await AsyncStorage.getItem(KEY) ?? JSON.parse(PortfolioButtonGroupTabKey.USD)
    return JSON.parse(val)
}

export const PortfolioCurrencyPersistence = {
    set,
    get
}
