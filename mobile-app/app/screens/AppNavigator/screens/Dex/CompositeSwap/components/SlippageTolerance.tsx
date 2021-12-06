import React from 'react'
import { TouchableOpacity } from 'react-native'
import { ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

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
      <ThemedSectionTitle
        testID='title_slippage'
        text={translate('screens/SlippageTolerance', 'SLIPPAGE TOLERANCE')}
      />

      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex-row p-4')}
      >
        {
          percentageList.map((p) => (
            <TouchableOpacity
              key={p.label}
              onPress={() => onSetSlippage(p.amount)}
              style={tailwind(`${buttonStyles} ${slippage === p.amount ? activeStyle : ''}`)}
              testID={`slippage_${p.label}`}
            >
              <ThemedText
                dark={tailwind(`${slippage === p.amount ? 'text-gray-200' : ''}`)}
                light={tailwind(`${slippage === p.amount ? 'text-white' : ''}`)}
                style={tailwind('font-medium text-primary-500')}
              >
                {p.label}
              </ThemedText>
            </TouchableOpacity>
          ))
        }
      </ThemedView>
    </>
  )
}
