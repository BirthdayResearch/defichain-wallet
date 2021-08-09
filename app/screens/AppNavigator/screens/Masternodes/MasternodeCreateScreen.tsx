import * as React from 'react'
import { useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { Button } from '../../../../components/Button'
import { RootState } from '../../../../store'
import { tailwind } from '../../../../tailwind'
import { MasternodeParamList } from './MasternodesNavigator'
import { translate } from '../../../../translations'
import { TextInput, View } from '../../../../components'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { SectionTitle } from '../../../../components/SectionTitle'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { MaterialIcons } from '@expo/vector-icons'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { hasTxQueued, transactionQueue } from '../../../../store/transaction_queue'
import { Control, Controller, useForm } from 'react-hook-form'
import { NetworkName } from '@defichain/jellyfish-network'
import { Logging } from '../../../../api'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
// import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
// import { token } from '@defichain/jellyfish-api-core'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
// import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { RadioButton } from '../../../../components/RadioButton'
import { RadioGroup } from '../../../../components/RadioGroup'

interface CreateMasternodeForm {
  operatorAddress: string
}

const radioAddressTypes = [{
  text: 'Owner Address'
}, {
  text: 'Operator Address'
}]

type Props = StackScreenProps<MasternodeParamList, 'CreateMasternodeScreen'>

export function MasternodeCreateScreen ({ navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  // const client = useWhaleApiClient()
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSelectedAddressType/*, setCurrentSelectedAddressType */] = useState<number>(0)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  const dispatch = useDispatch()

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    console.log('isValid: ', isValid)
    setIsSubmitting(true)
    if (isValid) {
      const values = getValues()
      console.log('values: ', values)
      await create(
        {
          operatorAddress: values.operatorAddress
        },
        dispatch
      ).catch(err => {
        console.log('create err: ', err)
        Logging.error(err)
      })
    }
    setIsSubmitting(false)
  }

  async function onGenAddressButtonPress (): Promise<void> {
    // generate address using txn-builder?
    // return await client.wallet.getNewAddress()
    // setValue('operatorAddress', address)
    setValue('operatorAddress', '2N9pHg9wKQK5hZxzwPfxZfy3jw76YFXriS2')
    console.log('isValid: ', isValid)
  }

  async function create ({
    operatorAddress
  }: CreateMasternodeForm,
  dispatch: Dispatch<any>
  ): Promise<void> {
    try {
      const operatorAuthAddress = DeFiAddress.from(networkName, operatorAddress).getScript()
      console.log('operatorAuthAddress: ', operatorAuthAddress)

      // const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const signer = async (account: WhaleWalletAccount): Promise<any> => {
        console.log('sign')
        const script = await account.getScript()
        console.log('script: ', script)
        console.log('account: ', account)

        // const builder = account.withTransactionBuilder()

        const createMasternode = {
          operatorType: 1, // 1 | 4
          // TODO(canonbrother): display input only if pick set operatorAddr option
          operatorAuthAddress: operatorAddress
          // TODO(canonbrother): need to check how timelock work
          // timeLock: 0
        }
        console.log('createMasternode: ', createMasternode)

        // TODO(canonbrother): pending on createmn txn builder merge
        // const dfTx = await builder.masternode.create(createMasternode, script)
        // return new CTransactionSegWit(dfTx)

        return ''
      }

      dispatch(transactionQueue.actions.push({
        sign: signer,
        title: `${translate('screens/CreateMasternode', 'Creating Masternode')}`
      }))
    } catch (err) {
      console.log('err: ', err)
      Logging.error(err)
    }
  }

  async function onAddressTypeButtonPress (index: number): Promise<void> {
    // setCurrentSelectedAddressType(index)
    setValue('currentSelectedAddressType', index)
    await trigger('currentSelectedAddressType')
    const values = getValues()
    console.log('values: ', values)
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <AddressTypeSelectionRow
        control={control}
        currentSelectedAddressType={currentSelectedAddressType}
        onAddressTypeButtonPress={onAddressTypeButtonPress}
      />
      {currentSelectedAddressType === 1 && (
        <AddressRow
          control={control}
          networkName={networkName}
          onGenAddressButtonPress={async () => await onGenAddressButtonPress()}
          onQrButtonPress={() => navigation.navigate('BarCodeScanner', {
            onQrScanned: (value: any) => setValue('operatorAddress', value)
          })}
          getValues={() => getValues()}
        />
      )}
      <Button
        testID='create_masternode_button'
        disabled={!isValid || isSubmitting || hasPendingJob}
        label={translate('screens/MasternodeCreateScreen', 'CREATE')}
        title='Create' onPress={onSubmit}
      />
    </ScrollView>
  )
}

function AddressTypeSelectionRow ({
  control,
  currentSelectedAddressType,
  onAddressTypeButtonPress
}: {
  control: Control
  currentSelectedAddressType: number
  onAddressTypeButtonPress: (index: number) => void
}): JSX.Element {
  return (
    <>
      <Controller
        control={control}
        rules={{
          required: true,
          validate: {
            zero: (value: number) => {
              console.log('zero')
              return value === currentSelectedAddressType
            }
          }
        }}
        render={({ field: { value } }) => {
          console.log('value: ', value)
          return (
            <RadioGroup
              items={radioAddressTypes}
              component={(item, index) => {
                const isChecked = currentSelectedAddressType === index
                return (
                  <RadioButton
                    key={index}
                    isChecked={isChecked}
                    text={item.text}
                    onChange={() => onAddressTypeButtonPress(index)}
                  />
                )
              }}
            />
          )
        }}
        name='addressType'
        defaultValue={0}
      />
    </>
  )
}

function AddressRow ({
  control,
  networkName,
  onGenAddressButtonPress,
  onQrButtonPress,
  getValues
}: {
  control: Control
  networkName: NetworkName
  onGenAddressButtonPress: () => void
  onQrButtonPress: () => void
  getValues: () => any
}): JSX.Element {
  return (
    <>
      <SectionTitle
        text={translate('screens/MasternodeCreateScreen', 'OPERATOR ADDRESS')}
        testID='title_operator_address'
      />
      <Controller
        control={control}
        rules={{
          required: true,
          validate: {
            // TODO(canonbrother): other than validate network type, also validate address type (legacy and bech32)
            isValidAddress: (address) => {
              console.log('isValidAddress')
              if (getValues().addressType === 0) {
                console.log('isValidAddress 1')
                return true
              } else {
                console.log('isValidAddress 2')
                return DeFiAddress.from(networkName, address).valid
              }
            }
          }
        }}
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full')}>
            <TextInput
              testID='address_input'
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/MasternodeCreateScreen', 'Enter an operator address')}
            />
            <TouchableOpacity
              testID='gen_addr_button'
              style={tailwind('w-14 p-4 bg-white')}
              onPress={onGenAddressButtonPress}
            >
              <MaterialIcons name='refresh' size={24} style={tailwind('text-primary')} />
            </TouchableOpacity>
            <TouchableOpacity
              testID='qr_code_button'
              style={tailwind('w-14 p-4 bg-white')}
              onPress={onQrButtonPress}
            >
              <MaterialIcons name='qr-code-scanner' size={24} style={tailwind('text-primary')} />
            </TouchableOpacity>
          </View>
        )}
        name='operatorAddress'
        defaultValue=''
      />
    </>
  )
}
