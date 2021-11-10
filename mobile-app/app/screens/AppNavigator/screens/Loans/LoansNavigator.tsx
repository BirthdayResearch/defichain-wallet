import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { LoadingState, LoansScreen } from './LoansScreen'
import { CreateVaultScreen } from './screens/CreateVaultScreen'
import { ConfirmCreateVaultScreen } from './screens/ConfirmCreateVaultScreen'
import BigNumber from 'bignumber.js'
import { VaultDetailScreen } from './VaultDetail/VaultDetailScreen'
import { AddCollateralScreen, Collateral } from './screens/AddCollateralScreen'
import { ConfirmAddCollateralScreen } from './screens/ConfirmAddCollateralScreen'

export interface LoanParamList {
  LoansScreen: {
    loadingState: LoadingState // TODO: remove hard-coded condition used for create vault flow
  }
  CreateVaultScreen: {
    loanScheme?: LoanScheme
  }
  ConfirmCreateVaultScreen: {
    loanScheme: LoanScheme
    fee: BigNumber
  }
  VaultDetailScreen: {
    vaultId: string
    emptyActiveLoans?: boolean // TODO: remove hard-coded value
  }
  AddCollateralScreen: {
    vaultId: string
  }
  ConfirmAddCollateralScreen: {
    vaultId: string
    collaterals: Collateral[] // TODO: update type
    totalCollateralValue: BigNumber
    fee: BigNumber
  }
  [key: string]: undefined | object
}

const LoansStack = createStackNavigator<LoanParamList>()

export function LoansNavigator (): JSX.Element {
  const headerContainerTestId = 'loans_header_container'

  return (
    <LoansStack.Navigator
      initialRouteName='LoansScreen'
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false
      }}
    >
      <LoansStack.Screen
        component={LoansScreen}
        name='LoansScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Loans') + ' (Beta)'} // TODO: remove beta from title
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />
      <LoansStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
      <LoansStack.Screen
        component={CreateVaultScreen}
        name='CreateVaultScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Create Vault') + ' (Beta)'} // TODO: remove beta from title
            />
          )
        }}
      />
      <LoansStack.Screen
        component={ConfirmCreateVaultScreen}
        name='ConfirmCreateVaultScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Confirm Create Vault') + ' (Beta)'} // TODO: remove beta from title
            />
          )
        }}
      />
      <LoansStack.Screen
        component={VaultDetailScreen}
        name='VaultDetailScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Vault Detail') + ' (Beta)'} // TODO: remove beta from title
            />
          )
        }}
      />
      <LoansStack.Screen
        component={AddCollateralScreen}
        name='AddCollateralScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Add Collateral') + ' (Beta)'} // TODO: remove beta from title
            />
          )
        }}
      />
      <LoansStack.Screen
        component={ConfirmAddCollateralScreen}
        name='ConfirmAddCollateralScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Confirm Add Collateral') + ' (Beta)'} // TODO: remove beta from title
            />
          )
        }}
      />
    </LoansStack.Navigator>
  )
}
