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
import { useWallet } from '../../../../contexts/WalletContext'

interface CreateMasternodeForm {
  operatorAddress: string
}

const radioAddressTypes = [{
  id: 'owner_address',
  text: 'Owner Address'
}, {
  id: 'operator_address',
  text: 'Operator Address'
}]

type Props = StackScreenProps<MasternodeParamList, 'CreateMasternodeScreen'>

export function MasternodeCreateScreen ({ navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  const wallet = useWallet()
  // const client = useWhaleApiClient()
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSelectedAddressType, setCurrentSelectedAddressType] = useState<number>(0)
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
    await trigger('operatorAddress')
  }

  async function create ({
    operatorAddress
  }: CreateMasternodeForm,
  dispatch: Dispatch<any>
  ): Promise<void> {
    try {
      // const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const signer = async (account: WhaleWalletAccount): Promise<any> => {
        console.log('sign')

        const script = await account.getScript()
        const operatorAuthAddress = currentSelectedAddressType === 0
          ? script
          : DeFiAddress.from(networkName, operatorAddress).getScript()

        const useAddress = currentSelectedAddressType === 0
          ? await wallet.get(0).getAddress()
          : operatorAddress

        // 0x01 = p2pkh (legacy), 0x04 = p2wpkh (bech32)
        const operatorType = useAddress.substr(0, 1) === '1' ? 1 : 4

        const createMasternode = {
          operatorType: operatorType,
          // TODO(canonbrother): display input only if pick set operatorAddr option
          operatorAuthAddress: operatorAuthAddress
          // TODO(canonbrother): need to check how timelock work
          // timeLock: 0
        }
        console.log('createMasternode: ', createMasternode)
        // const builder = account.withTransactionBuilder()

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
    // state
    setCurrentSelectedAddressType(index)
    // form
    setValue('currentSelectedAddressType', index)
    await trigger('currentSelectedAddressType')
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
    <Controller
      control={control}
      rules={{
        required: true,
        validate: {
          isOwnerAddress: (value: number) => value === 0
        }
      }}
      render={({ field: { value } }) => {
        console.log('value: ', value)
        return (
          <RadioGroup
            testID='address_type_radio'
            items={radioAddressTypes}
            component={(item, index) => {
              const isChecked = currentSelectedAddressType === index
              return (
                <RadioButton
                  testID={`${item.id as string}_radio`}
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
  )
}

function AddressRow ({
  control,
  networkName,
  onGenAddressButtonPress,
  onQrButtonPress
}: {
  control: Control
  networkName: NetworkName
  onGenAddressButtonPress: () => void
  onQrButtonPress: () => void
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
            isValidAddress: (address) => DeFiAddress.from(networkName, address).valid
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
