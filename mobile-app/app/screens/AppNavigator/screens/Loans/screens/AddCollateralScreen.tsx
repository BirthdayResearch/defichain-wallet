import { View } from '@components'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedProps, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { LoanParamList } from '../LoansNavigator'
import { BottomSheetNavScreen, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { AddOrEditCollateralForm, AddOrEditCollateralFormProps } from '../components/AddOrEditCollateralForm'
import { BottomSheetTokenList } from '@components/BottomSheetTokenList'
import { WalletAlert } from '@components/WalletAlert'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

type Props = StackScreenProps<LoanParamList, 'AddCollateralScreen'>

export interface BottomSheetWithNavRouteParam {
  AddOrEditCollateralForm: AddOrEditCollateralFormProps
  [key: string]: undefined | object
}

export interface Collateral {
  collateralId: string
  collateralFactor: BigNumber
  amount: BigNumber
  amountValue: BigNumber
  vaultProportion: BigNumber
  available: BigNumber
}

export function AddCollateralScreen ({ route, navigation }: Props): JSX.Element {
  const { vaultId } = route.params
  const client = useWhaleApiClient()
  const logger = useLogger()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const collaterals: Collateral[] = [
    {
      collateralId: 'DFI',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('18769865765623.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('40'),
      available: new BigNumber(123123)
    },
    {
      collateralId: 'dBTC',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('123.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('100'),
      available: new BigNumber(123123)
    },
    {
      collateralId: 'dETH',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('123.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('100'),
      available: new BigNumber(123123)
    },
    {
      collateralId: 'dLTC',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('123.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('100'),
      available: new BigNumber(123123)
    },
    {
      collateralId: 'dBCH',
      collateralFactor: new BigNumber(100),
      amount: new BigNumber('123.123123'),
      amountValue: new BigNumber('369.369'),
      vaultProportion: new BigNumber('100'),
      available: new BigNumber(123123)
    }
  ]
  const totalCollateralValue = new BigNumber(1081312326112)
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const expandModal = useCallback(() => {
    bottomSheetRef.current?.present()
  }, [])
  const dismissModal = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])
  const onContinuePress = (): void => {
    navigation.navigate({
      name: 'ConfirmAddCollateralScreen',
      params: {
        vaultId,
        collaterals,
        totalCollateralValue,
        fee
      },
      merge: true
    })
  }
  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  return (
    <View style={tailwind('flex-1')}>
      <ThemedScrollView
        contentContainerStyle={tailwind('p-4 pt-0')}
      >
        <SectionTitle title='COLLATERALS WILL BE ADDED TO VAULT' />
        <VaultIdSection vaultId={vaultId} />
        <SectionTitle title='ADD DFI AND TOKENS FOR COLLATERAL' />
        {collaterals.map(collateral => (
          <CollateralCard
            key={collateral.collateralId}
            {...collateral}
            onEditPress={(collateral: CollateralCardProps) => {
              setBottomSheetScreen([
                {
                  stackScreenName: 'AddOrEditCollateralForm',
                  component: AddOrEditCollateralForm,
                  initialParam: {
                    token: collateral.collateralId,
                    collateralFactor: collateral.collateralFactor,
                    available: collateral.available,
                    current: collateral.amount,
                    onButtonPress: () => {
                      // TODO: set state of collateral
                      dismissModal()
                    }
                  },
                  option: {
                    header: () => null
                  }
                }
              ])
              expandModal()
            }}
            onRemovePress={() => {
              WalletAlert({
                title: translate('screens/AddCollateralScreen', 'Are you sure you want to remove collateral token?'),
                buttons: [
                  {
                    text: translate('screens/AddCollateralScreen', 'Cancel'),
                    style: 'cancel'
                  },
                  {
                    text: translate('screens/AddCollateralScreen', 'Remove'),
                    style: 'destructive',
                    onPress: () => {
                      // TODO: handle on remove collateral
                    }
                  }
                ]
              })
            }}
          />
          ))}
        <LearnMoreCollateralFactor />
        <AddCollateralButton
          disabled={false} /* TODO: add validation to check if DFI >= 50% */
          onPress={() => {
            setBottomSheetScreen([
              {
                stackScreenName: 'TokenList',
                component: BottomSheetTokenList({
                  headerLabel: translate('screens/AddCollateralScreen', 'Select token to add'),
                  onCloseButtonPress: () => bottomSheetRef.current?.close(),
                  navigateToScreen: {
                    screenName: 'AddOrEditCollateralForm',
                    onButtonPress: () => {
                      /* TODO: set state of collateral */
                      dismissModal()
                    }
                  }
                }),
                option: {
                  header: () => null
                }
              },
              {
                stackScreenName: 'AddOrEditCollateralForm',
                component: AddOrEditCollateralForm,
                option: {
                  headerStatusBarHeight: 1,
                  headerTitle: '',
                  headerBackTitleVisible: true,
                  headerBackTitle: translate('screens/AddCollateralScreen', 'BACK')
                }
              }
            ])
            expandModal()
          }}
        />
      </ThemedScrollView>
      <FooterSection totalCollateralValue={totalCollateralValue} onContinuePress={onContinuePress} isValid />
      <BottomSheetWithNav
        modalRef={bottomSheetRef}
        screenList={bottomSheetScreen}
      />
      {/* TODO: handle bottom sheet in desktop */}
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
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
      style={tailwind('flex flex-row items-center border rounded px-4 py-5')}
    >
      <ThemedView
        light={tailwind('bg-gray-100')}
        dark={tailwind('bg-dfxblue-900')}
        style={tailwind('w-6 h-6 rounded-full flex items-center justify-center mr-2')}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          name='shield'
          size={11}
          light={tailwind('text-gray-600')}
          dark={tailwind('text-dfxgray-300')}
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
  available: BigNumber
  onEditPress: (collateral: CollateralCardProps) => void
  onRemovePress: () => void
}

function CollateralCard (props: CollateralCardProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
      style={tailwind('border rounded p-4 mb-2')}
    >
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
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
            dark={tailwind('text-dfxgray-300 border-dfxgray-300')}
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
                  dark={tailwind('text-dfxgray-300')}
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
            onPress={() => props.onEditPress(props)}
          />
          {props.collateralId !== 'DFI' &&
            (
              <IconButton
                iconType='MaterialIcons'
                iconName='remove-circle-outline'
                iconSize={20}
                style={tailwind('ml-2')}
                onPress={() => props.onRemovePress()}
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
                        dark={tailwind('text-dfxgray-400')}
                        light={tailwind('text-dfxgray-500')}
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
        <View style={tailwind('w-4/12 flex items-end')}>
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
                dark={tailwind('bg-dfxblue-900')}
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
      light={tailwind('text-dfxgray-500')}
      dark={tailwind('text-dfxgray-400')}
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
        light={tailwind('text-dfxgray-400')}
        dark={tailwind('text-dfxgray-500')}
        style={tailwind('text-xs font-medium')}
      >
        {translate('screens/AddCollateralScreen', 'Each token has their own collateral factor that would affect its respective collateral value. ')}
        <TouchableOpacity
          onPress={() => { /* TODO: handle learn more link */ }}
        >
          <ThemedText
            light={tailwind('text-primary-500')}
            dark={tailwind('text-dfxred-500')}
            style={tailwind('text-xs font-medium underline relative top-0.5')}
          >
            {translate('screens/AddCollateralScreen', 'Learn more')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedText>
    </View>
  )
}

function AddCollateralButton (props: {disabled: boolean, onPress: () => void}): JSX.Element {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={tailwind('mt-8 mb-44 flex flex-row justify-center')}
      onPress={props.onPress}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='add'
        size={14}
        light={tailwind({ 'text-primary-500': !props.disabled, 'text-dfxgray-300': props.disabled })}
        dark={tailwind({ 'text-dfxred-500': !props.disabled, 'text-gray-600': props.disabled })}
      />
      <ThemedText
        light={tailwind({ 'text-primary-500': !props.disabled, 'text-dfxgray-300': props.disabled })}
        dark={tailwind({ 'text-dfxred-500': !props.disabled, 'text-gray-600': props.disabled })}
        style={tailwind('pl-2.5 text-sm font-medium leading-4')}
      >
        {translate('screens/AddCollateralScreen', 'ADD TOKEN AS COLLATERAL')}
      </ThemedText>
    </TouchableOpacity>
  )
}

function FooterSection (props: {totalCollateralValue: BigNumber, onContinuePress: () => void, isValid: boolean}): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
      style={tailwind('border-t absolute left-0 bottom-0 w-full px-4 py-6')}
    >
      <View style={tailwind('flex flex-row justify-between mb-5')}>
        <ThemedText
          light={tailwind('text-dfxgray-500')}
          dark={tailwind('text-dfxgray-500')}
          style={tailwind('text-sm font-medium w-6/12')}
        >
          {translate('screens/AddCollateralScreen', 'Total collateral value (USD)')}
        </ThemedText>
        <NumberFormat
          value={props.totalCollateralValue.toFixed(2)}
          decimalScale={2}
          displayType='text'
          thousandSeparator
          prefix='$'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
              style={tailwind('text-sm font-semibold w-6/12 text-right')}
            >
              {value}
            </ThemedText>}
        />
      </View>
      <Button
        disabled={!props.isValid}
        label={translate('screens/AddCollateralScreen', 'CONTINUE')}
        onPress={props.onContinuePress}
        testID='add_collateral_button'
        margin='mb-2'
      />
      <ThemedText
        light={tailwind('text-dfxgray-500')}
        dark={tailwind('text-dfxgray-500')}
        style={tailwind('text-xs text-center')}
      >
        {translate('screens/AddCollateralScreen', 'Confirm details in next screen')}
      </ThemedText>
    </ThemedView>
  )
}
