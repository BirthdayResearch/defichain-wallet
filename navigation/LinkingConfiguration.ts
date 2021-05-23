import * as Linking from 'expo-linking'

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Balances: {
            screens: {
              BalancesScreen: 'balances'
            }
          },
          Liquidity: {
            screens: {
              LiquidityScreen: 'liquidity'
            }
          },
          Transactions: {
            screens: {
              TransactionsScreen: 'transactions'
            }
          },
          Settings: {
            screens: {
              SettingsScreen: 'settings'
            }
          }
        }
      },
      NotFound: '*'
    }
  }
}
