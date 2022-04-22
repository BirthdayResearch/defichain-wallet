import AsyncStorage from '@react-native-async-storage/async-storage'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Balances/components/TotalPortfolio'

const KEY = 'WALLET.PORTFOLIO_CURRENCY'

async function set (denominationCurrency: NonNullable<PortfolioButtonGroupTabKey>): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(denominationCurrency))
}

async function get (): Promise<PortfolioButtonGroupTabKey> {
    const val = await AsyncStorage.getItem(KEY)
    return val != null ? JSON.parse(val) : 'USDT'
}

export const PortfolioCurrencyPersistence = {
    set,
    get
}
