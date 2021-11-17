import React from 'react'
import BigNumber from 'bignumber.js'
import {
  ThemedIcon,
  ThemedProps,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '../../../../../components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { IconButton } from '@components/IconButton'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { LoanVault } from '@store/loans'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'

export interface VaultCardProps extends React.ComponentProps<any> {
  vault: LoanVault
}

export enum VaultStatus {
  New = '',
  Locked = 'Locked',
  AtRisk = 'At risk',
  Safe = 'Safe'
}

export function VaultCard (props: VaultCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const vault = props.vault as LoanVaultActive
  const onCardPress = (vaultId: string): void => {
    navigation.navigate('VaultDetailScreen', {
      vaultId
    })
  }
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <ThemedTouchableOpacity
        testID={props.testID}
        onPress={() => onCardPress(vault.vaultId)}
        light={tailwind('border-b-0')}
        dark={tailwind('border-b-0')}
      >
        <View style={tailwind('flex flex-row justify-between mb-4')}>
          <View style={tailwind('flex flex-row items-center')}>
            <View style={tailwind('flex flex-col')}>
              <View style={tailwind('flex flex-row')}>
                <View style={tailwind('flex flex-col')}>
                  <ThemedText
                    light={tailwind('text-gray-400')}
                    dark={tailwind('text-gray-500')}
                    style={tailwind('text-xs mr-1.5')}
                  >
                    {translate('screens/VaultDetailScreen', 'Vault ID')}
                  </ThemedText>
                  <ThemedText
                    style={tailwind('font-semibold w-44 flex-shrink')}
                    numberOfLines={1}
                    ellipsizeMode='middle'
                  >
                    {vault.vaultId}
                  </ThemedText>
                </View>
                {/* {props.status !== undefined &&
                  (
                    <VaultStatusTag status={props.status} />
                  )} */}
              </View>
              <View style={tailwind('flex flex-row')}>
                <ThemedText
                  light={tailwind('text-gray-500')}
                  dark={tailwind('text-gray-300')}
                  style={tailwind('text-xs mr-1')}
                >
                  {translate('components/VaultCard', 'Collaterals:')}
                </ThemedText>
                {
                  vault.collateralAmounts.length === 0 &&
                  (
                    <ThemedText
                      light={tailwind('text-gray-500')}
                      dark={tailwind('text-gray-300')}
                      style={tailwind('text-xs ml-1')}
                    >
                      {translate('components/VaultCard', 'None')}
                    </ThemedText>
                  )
                }
                <TokenIconGroup
                  symbols={vault.collateralAmounts.map(collateral => collateral.displaySymbol)}
                  maxIconToDisplay={3}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={tailwind('flex flex-row flex-wrap -mb-2')}>
          {/* <VaultInfo label='Active loans' tokens={props.activeLoans?.map(loan => loan.tokenId)} valueType='TOKEN_ICON_GROUP' /> */}
          {/* <VaultInfo label='Total loan amount (USD)' value={props.totalLoanAmount} prefix='$' decimalPlace={2} valueType='NUMBER' /> */}
          {/* <VaultInfo label='Collateral amount (USD)' value={props.collateralAmount} prefix='$' decimalPlace={2} valueType='NUMBER' /> */}
          {/* <VaultInfo
            label='Collateral ratio'
            value={props.collateralRatio}
            suffix='%'
            decimalPlace={2}
            valueType='NUMBER'
            valueThemedProps={props.collateralRatio !== undefined ? getCollateralRatioColor(props.collateralRatio) : undefined}
          /> */}
        </View>
      </ThemedTouchableOpacity>
      <VaultActionButton vault={vault} />
    </ThemedView>
  )
}

export function VaultStatusTag (props: { status: VaultStatus }): JSX.Element | null {
  if (props.status === VaultStatus.New) {
    return null
  }

  return (
    <ThemedView
      light={tailwind(
        {
          'bg-gray-700': props.status === VaultStatus.Locked,
          'bg-warning-50': props.status === VaultStatus.AtRisk,
          'bg-success-50': props.status === VaultStatus.Safe
        }
      )}
      dark={tailwind(
        {
          'bg-gray-100': props.status === VaultStatus.Locked,
          'bg-darkwarning-50': props.status === VaultStatus.AtRisk,
          'bg-darksuccess-50': props.status === VaultStatus.Safe
        }
      )}
      style={tailwind('rounded-xl mx-2 flex flex-row items-center')}
    >
      {props.status === VaultStatus.Locked &&
      (
        <ThemedIcon
          iconType='MaterialIcons'
          name='lock'
          size={14}
          light={tailwind('text-gray-100')}
          dark={tailwind('text-gray-800')}
          style={tailwind('ml-2')}
        />
      )}
      <ThemedText
        light={tailwind(
          {
            'text-gray-100': props.status === VaultStatus.Locked,
            'text-warning-600': props.status === VaultStatus.AtRisk,
            'text-success-600': props.status === VaultStatus.Safe
          }
        )}
        dark={tailwind(
          {
            'text-gray-800': props.status === VaultStatus.Locked,
            'text-darkwarning-600': props.status === VaultStatus.AtRisk,
            'text-darksuccess-600': props.status === VaultStatus.Safe
          }
        )}
        style={tailwind('px-2 py-1 font-medium text-xs', { 'pl-1': props.status === VaultStatus.Locked })}
      >
        {translate('components/VaultCard', props.status)}
      </ThemedText>
    </ThemedView>
  )
}

export function getCollateralRatioColor (value: BigNumber): ThemedProps {
  let lightStyle, darkStyle

  if (value.isLessThan(100)) {
    lightStyle = 'text-error-500'
    darkStyle = 'text-darkerror-500'
  } else if (value.isLessThan(300)) {
    lightStyle = 'text-warning-500'
    darkStyle = 'text-darkwarning-500'
  } else {
    lightStyle = 'text-success-500'
    darkStyle = 'text-darksuccess-500'
  }

  return {
    light: tailwind(lightStyle),
    dark: tailwind(darkStyle)
  }
}

function VaultActionButton ({ vault }: { vault: LoanVaultActive }): JSX.Element | null {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <ThemedView
      light={tailwind('border-gray-200')}
      dark={tailwind('border-gray-700')}
      style={tailwind('flex flex-row mt-4 flex-wrap -mb-2')}
    >
      {/* {
        <IconButton
          key={action}
          iconType='MaterialIcons'
          iconName='credit-card'
          iconLabel={translate('components/VaultCard', 'VIEW LOANS')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={props.onViewLoans}
        />
      } */}

      <IconButton
        iconType='MaterialIcons'
        iconName='add'
        iconLabel={translate('components/VaultCard', 'ADD COLLATERAL')}
        iconSize={16}
        style={tailwind('mr-2 mb-2')}
        onPress={() => {
          navigation.navigate({
            name: 'AddCollateralScreen',
            params: {
              vaultId: vault.vaultId
            },
            merge: true
          })
        }}
      />
    </ThemedView>
  )
}
