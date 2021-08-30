import React from 'react'
import { TouchableOpacity } from 'react-native'
import { SectionTitle } from '../../../../../../components/SectionTitle'
import { ThemedText, ThemedView } from '../../../../../../components/themed'
import { tailwind } from '../../../../../../tailwind'
import { translate } from '../../../../../../translations'

export function SlippageTolerance ({
  slippage,
  setSlippage
}: { slippage: number, setSlippage: (slippage: number) => void }): JSX.Element {
  const onSetSlippage = (amount: number): void => {
    setSlippage(amount)
  }

  const buttonStyles = 'flex px-2 py-1.5 border border-gray-300 rounded mr-2'
  const activeStyle = 'bg-primary-500 border-primary-500'
  const percentageList = [{ label: '1%', amount: 0.01 }, { label: '3%', amount: 0.03 }, {
    label: '5%',
    amount: 0.05
  }, { label: '10%', amount: 0.1 }, { label: '20%', amount: 0.2 }]

  return (
    <>
      <SectionTitle text={translate('screens/SlippageTolerance', 'SLIPPAGE TOLERANCE')} testID='title_slippage' />
      <ThemedView
        style={tailwind('flex-row p-4')} light={tailwind('bg-white border-b border-gray-200')}
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
      >
        {
          percentageList.map((p) => (
            <TouchableOpacity
              testID={`slippage_${p.label}`}
              key={p.label}
              style={tailwind(`${buttonStyles} ${slippage === p.amount ? activeStyle : ''}`)}
              onPress={() => onSetSlippage(p.amount)}
            >
              <ThemedText
                light={tailwind(`${slippage === p.amount ? 'text-white' : ''}`)}
                dark={tailwind(`${slippage === p.amount ? 'text-gray-200' : ''}`)}
                style={tailwind('font-medium text-primary-500')}
              >{p.label}
              </ThemedText>
            </TouchableOpacity>
          ))
        }
      </ThemedView>
    </>
  )
}
