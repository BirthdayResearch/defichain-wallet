
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { LoanVault } from '@store/loans'
import { CollateralToken, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { EmptyCollateral } from './EmptyCollateral'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { getCollateralPrice } from '../../hooks/CollateralPrice'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'

interface CollateralCardProps {
  displaySymbol: string
  amount: BigNumber
  collateralItem: CollateralToken
  totalCollateralValue: BigNumber
}

export function CollateralsTab ({ vault }: {vault: LoanVault}): JSX.Element {
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)

  if (vault.state === LoanVaultState.ACTIVE && vault.collateralValue === '0') {
    return (
      <EmptyCollateral vaultId={vault.vaultId} />
    )
  }

  return (
    <View style={tailwind('p-4')}>
      {vault.state === LoanVaultState.IN_LIQUIDATION && vault.batches.length > 0 &&
        (
          vault.batches[0].collaterals.map(collateral => {
            return (
              <LiquidatedVaultCollateralCard
                key={collateral.id}
                displaySymbol={collateral.displaySymbol}
              />
            )
          })
        )}
      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        (
          vault.collateralAmounts.map((collateral, index) => {
            const collateralItem = collateralTokens.find((col) => col.token.id === collateral.id)
            if (collateralItem !== undefined) {
              return (
                <CollateralCard
                  key={collateral.id}
                  collateralItem={collateralItem}
                  totalCollateralValue={new BigNumber(vault.collateralValue)}
                  displaySymbol={collateral.displaySymbol}
                  amount={new BigNumber(collateral.amount)}
                />
              )
            } else {
              // TODO Add Skeleton Loader
              return <View key={index} />
            }
          })
        )}
    </View>
  )
}

function LiquidatedVaultCollateralCard ({ displaySymbol }: { displaySymbol: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row justify-between items-center')}>
        <View style={tailwind('flex flex-row items-center')}>
          <SymbolIcon symbol={displaySymbol} styleProps={tailwind('w-4 h-4')} />
          <ThemedText
            light={tailwind('text-gray-300')}
            dark={tailwind('text-gray-600')}
            style={tailwind('ml-2 font-medium')}
          >
            {displaySymbol}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  )
}

function CollateralCard (props: CollateralCardProps): JSX.Element {
  const prices = getCollateralPrice(props.amount, props.collateralItem, props.totalCollateralValue)
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row justify-between items-center')}>
        <View style={tailwind('flex flex-row items-center')}>
          <SymbolIcon symbol={props.displaySymbol} styleProps={tailwind('w-4 h-4')} />
          <ThemedText
            light={tailwind('text-black')}
            dark={tailwind('text-white')}
            style={tailwind('ml-2 font-medium')}
            testID={`vault_detail_collateral_${props.displaySymbol}`}
          >
            {props.displaySymbol}
          </ThemedText>
        </View>
        <NumberFormat
          value={prices.vaultShare?.toFixed(2)}
          thousandSeparator
          decimalScale={2}
          displayType='text'
          suffix='%'
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('font-medium')}
              testID={`vault_detail_collateral_${props.displaySymbol}_vault_share`}
            >
              {val}
            </ThemedText>
          )}
        />
      </View>
      <View style={tailwind('flex flex-row mt-3')}>
        <View style={tailwind('w-8/12')}>
          <CardLabel text='Collateral amount' />
          <View>
            <NumberFormat
              value={props.amount?.toFixed(8)}
              thousandSeparator
              decimalScale={8}
              displayType='text'
              suffix={` ${props.displaySymbol}`}
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-sm')}
                  testID={`vault_detail_collateral_${props.displaySymbol}_amount`}
                >
                  {val}
                </ThemedText>
              )}
            />
            <ActiveUSDValue price={new BigNumber(props.amount).multipliedBy(prices.activePrice)} />
          </View>
        </View>
      </View>
    </ThemedView>
  )
}

function CardLabel (props: {text: string}): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-500')}
      dark={tailwind('text-gray-400')}
      style={tailwind('text-xs mb-1')}
    >
      {translate('components/VaultDetailsCollateralsTab', props.text)}
    </ThemedText>
  )
}
