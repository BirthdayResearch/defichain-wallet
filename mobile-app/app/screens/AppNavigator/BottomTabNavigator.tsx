import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { OceanInterface } from '@components/OceanInterface/OceanInterface'
import { PortfolioNavigator } from './screens/Portfolio/PortfolioNavigator'
import { DexNavigator } from './screens/Dex/DexNavigator'
import { LoansNavigator } from './screens/Loans/LoansNavigator'
import { AuctionsNavigator } from './screens/Auctions/AuctionNavigator'
import { AuctionsIcon, DEXIcon, LoansIcon, PortfolioIcon } from '@screens/WalletNavigator/assets/BottomNavIcon'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface BottomTabParamList {
  Portfolio: undefined
  Dex: undefined
  Settings: undefined

  [key: string]: undefined | object
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

const getTabBarLabel = ({
  focused,
  color,
  title
}: { focused: boolean, color: string, title: string }): JSX.Element => (
  <Text style={{ color, ...tailwind('font-normal-v2 text-xs') }}>{focused ? title : ''}</Text>
)

export function BottomTabNavigator (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <>
      <OceanInterface />

      <BottomTab.Navigator
        initialRouteName='Portfolio'
        screenOptions={{
          headerShown: false,
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: tailwind('px-5 py-2 h-16', { 'bg-mono-light-v2-00': isLight }, { 'bg-mono-dark-v2-00': !isLight }),
          tabBarActiveTintColor: '#FF008C',
          tabBarInactiveTintColor: isLight ? '#121212' : '#FFFFFF'
        }}
      >
        <BottomTab.Screen
          component={PortfolioNavigator}
          name={translate('BottomTabNavigator', 'Portfolio')}
          options={{
            tabBarLabel: ({
              focused,
              color
            }) => getTabBarLabel({
              focused,
              color,
              title: translate('BottomTabNavigator', 'Portfolio')
            }),
            tabBarTestID: 'bottom_tab_portfolio',
            tabBarIcon: ({
              color
            }) => (
              <PortfolioIcon
                color={color}
                size={22}
              />
            )
          }}
        />

        <BottomTab.Screen
          component={DexNavigator}
          name={translate('BottomTabNavigator', 'DEX')}
          options={{
            tabBarLabel: ({
              focused,
              color
            }) => getTabBarLabel({
              focused,
              color,
              title: translate('BottomTabNavigator', 'DEX')
            }),
            tabBarTestID: 'bottom_tab_dex',
            tabBarIcon: ({
              color
            }) => (
              <DEXIcon
                color={color}
                size={22}
              />
            )
          }}
        />

        <BottomTab.Screen
          component={LoansNavigator}
          name={translate('BottomTabNavigator', 'Loans')}
          options={{
            tabBarLabel: ({
              focused,
              color
            }) => getTabBarLabel({
              focused,
              color,
              title: translate('BottomTabNavigator', 'Loans')
            }),
            tabBarTestID: 'bottom_tab_loans',
            tabBarIcon: ({
              color
            }) => (
              <LoansIcon
                color={color}
                size={22}
              />
            )
          }}
        />

        <BottomTab.Screen
          component={AuctionsNavigator}
          name={translate('BottomTabNavigator', 'Auctions')}
          options={{
            tabBarLabel: ({
              focused,
              color
            }) => getTabBarLabel({
              focused,
              color,
              title: translate('BottomTabNavigator', 'Auctions')
            }),
            tabBarTestID: 'bottom_tab_auctions',
            tabBarIcon: ({
              color
            }) => (
              <AuctionsIcon
                color={color}
                size={22}
              />
            )
          }}
        />

      </BottomTab.Navigator>
    </>
  )
}

export const AppLinking = {
  Portfolio: {
    screens: {
      PortfolioScreen: 'portfolio'
    }
  },
  Dex: {
    screens: {
      DexScreen: 'dex'
    }
  },
  Transactions: {
    screens: {
      TransactionsScreen: 'transactions'
    }
  },
  Settings: {
    screens: {
      SettingsScreen: 'settings',
      PlaygroundScreen: 'settings/playground'
    }
  }
}
