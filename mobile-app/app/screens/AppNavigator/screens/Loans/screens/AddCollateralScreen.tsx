import { View } from '@components'
import { IconButton } from '@components/IconButton'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedProps, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'

import React from 'react'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { LoanParamList } from '../LoansNavigator'

type Props = StackScreenProps<LoanParamList, 'AddCollateralScreen'>

export function AddCollateralScreen ({ navigation }: Props): JSX.Element {
  const vaultId = '22ffasd5ca123123123123123121231061'
  const collaterals: CollateralCardProps[] = [
    {
      collateralId: 'DFI',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('18769865765623.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('40')
    },
    {
      collateralId: 'dBTC',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('123.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('100')
    }
  ]
  return (
    <View style={tailwind('flex-1')}>
      <ThemedScrollView
        contentContainerStyle={tailwind('p-4 pt-0')}
      >
        <SectionTitle title='YOU ARE ADDING COLLATERAL TO VAULT' />
        <VaultIdSection vaultId={vaultId} />
        <SectionTitle title='ADD DFI AND TOKENS FOR COLLATERAL' />
        {collaterals.map(collateral => (
          <CollateralCard key={collateral.collateralId} {...collateral} />
          ))}
        <LearnMoreCollateralFactor />
        {/* <IconButton iconLabel="Navigate to confirm" onPress={() => navigation.navigate('ConfirmAddCollateralScreen')}/>
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText>
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText>
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText> */}
      </ThemedScrollView>
      <ThemedView
        style={tailwind('absolute left-0 bottom-0 w-full')}
      >
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
      </ThemedView>
    </View>
  )
}

function SectionTitle (props: {title: string}): JSX.Element {
  return (
    <ThemedSectionTitle
      style={tailwind('text-xs pb-2 pt-4 font-medium')}
      text={translate('screens/AddCollateralScreen', props.title)}
    />
  )
}

function VaultIdSection (props: { vaultId: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('flex flex-row items-center border rounded px-4 py-5')}
    >
      <ThemedView
        light={tailwind('bg-gray-100')}
        dark={tailwind('bg-gray-700')}
        style={tailwind('w-6 h-6 rounded-full flex items-center justify-center mr-2')}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          name='shield'
          size={11}
          light={tailwind('text-gray-600')}
          dark={tailwind('text-gray-300')}
        />
      </ThemedView>
      <View
        style={tailwind('flex flex-1')}
      >
        <ThemedText
          style={tailwind('font-medium')}
          numberOfLines={1}
          ellipsizeMode='middle'
        >
          {props.vaultId}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

interface CollateralCardProps {
  collateralId: string
  collateralFactor: BigNumber
  amount: BigNumber
  amountValue: BigNumber
  vaultProportion: BigNumber
}

function CollateralCard (props: CollateralCardProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border rounded p-4 mb-2')}
    >
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('flex flex-row items-center justify-between border-b pb-4 mb-2')}
      >
        <View style={tailwind('flex flex-row items-center')}>
          <SymbolIcon symbol={props.collateralId} styleProps={{ width: 24, height: 24 }} />
          <ThemedText
            style={tailwind('font-medium ml-1 mr-2')}
          >
            {props.collateralId}
          </ThemedText>
          <ThemedView
            light={tailwind('text-gray-700 border-gray-700')}
            dark={tailwind('text-gray-300 border-gray-300')}
            style={tailwind('border rounded')}
          >
            <NumberFormat
              value={props.collateralFactor.toFixed(2)}
              decimalScale={2}
              displayType='text'
              suffix='%'
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-700')}
                  dark={tailwind('text-gray-300')}
                  style={tailwind('text-xs font-medium px-1')}
                >
                  {value}
                </ThemedText>}
            />
          </ThemedView>
        </View>
        <View style={tailwind('flex flex-row')}>
          <IconButton
            iconType='MaterialIcons'
            iconName='edit'
            iconSize={20}
          />
          {props.collateralId !== 'DFI' &&
            (
              <IconButton
                iconType='MaterialIcons'
                iconName='remove-circle-outline'
                iconSize={20}
                style={tailwind('ml-2')}
              />
            )}
        </View>
      </ThemedView>
      <View style={tailwind('flex flex-row justify-between')}>
        <View style={tailwind('w-8/12')}>
          <CardLabel text='Collateral amount' />
          <View style={tailwind('mt-0.5')}>
            <NumberFormat
              value={props.amount.toFixed(8)}
              thousandSeparator
              decimalScale={8}
              displayType='text'
              suffix={` ${props.collateralId}`}
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-sm font-medium')}
                >
                  {val}
                  <NumberFormat
                    value={props.amountValue.toFixed(8)}
                    thousandSeparator
                    decimalScale={2}
                    displayType='text'
                    prefix='$'
                    renderText={(val: string) => (
                      <ThemedText
                        dark={tailwind('text-gray-400')}
                        light={tailwind('text-gray-500')}
                        style={tailwind('text-xs')}
                      >
                        {` /${val}`}
                      </ThemedText>
                    )}
                  />
                </ThemedText>
              )}
            />

          </View>
        </View>
        <View style={tailwind('w-4/12 flex items-end justify-between')}>
          <CardLabel text='Vault %' />
          <NumberFormat
            value={props.vaultProportion.toFixed(2)}
            thousandSeparator
            decimalScale={2}
            displayType='text'
            suffix=' %'
            renderText={(val: string) => (
              <ThemedView
                light={tailwind('bg-gray-100')}
                dark={tailwind('bg-gray-900')}
                style={tailwind('px-2 py-0.5 rounded')}
              >
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  {...getVaultProportionThemedProps(props.collateralId, props.vaultProportion)}
                  style={tailwind('text-sm font-medium')}
                >
                  {val}
                </ThemedText>
              </ThemedView>
            )}
          />
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
      {translate('screens/AddCollateralScreen', props.text)}
    </ThemedText>
  )
}

function getVaultProportionThemedProps (id: string, proportion: BigNumber): ThemedProps | undefined {
  if (id !== 'DFI') {
    return
  }

  const minProportion = 50
  if (proportion.isLessThan(minProportion)) {
    return {
      light: tailwind('text-error-500'),
      dark: tailwind('text-darkerror-500')
    }
  }
}

function LearnMoreCollateralFactor (): JSX.Element {
  return (
    <View>
      <ThemedText
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-xs font-medium')}
      >
        {translate('screens/AddCollateralScreen', 'Each token has their own collateral factor that would affect its value as collateral. ')}
        <TouchableOpacity style={tailwind('')}>
          <ThemedText
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
            style={tailwind('text-xs font-medium underline relative top-0.5')}
          >
            {translate('screens/AddCollateralScreen', 'Learn more')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedText>
    </View>
  )
}
