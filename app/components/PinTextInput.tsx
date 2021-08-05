import React from 'react'
import { StyleSheet, View } from 'react-native'
import {
  CodeField,
  Cursor,
  isLastFilledCell,
  MaskSymbol,
  useBlurOnFulfill,
  useClearByFocusCell
} from 'react-native-confirmation-code-field'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export interface PinTextInputItem {
  cellCount: number
  testID: string
  value: string
  onChange: (text: string) => void
}

export interface RenderCellItem {
  index: number
  symbol: string
  isFocused: boolean
}

export function PinTextInput ({ cellCount, testID, value, onChange }: PinTextInputItem): JSX.Element {
  const ref = useBlurOnFulfill({ value, cellCount })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChange
  })

  const renderCell = ({ index, symbol, isFocused }: RenderCellItem): JSX.Element => {
    let textChild = null

    if (symbol !== undefined && symbol !== '') {
      textChild = (
        <MaskSymbol
          maskSymbol='●'
          isLastFilledCell={isLastFilledCell({ index, value })}
        >
          {symbol}
        </MaskSymbol>
      )
    } else if (isFocused) {
      textChild = <Cursor />
    }

    return (
      <Text
        testID={`${testID}_${index}`}
        key={index}
        style={[styles.cell, isFocused && styles.focusCell]}
        onLayout={getCellOnLayoutHandler(index)}
      >
        {textChild}
      </Text>
    )
  }

  return (
    <View style={tailwind('flex-row justify-center')}>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={onChange}
        cellCount={cellCount}
        keyboardType='number-pad'
        textContentType='oneTimeCode'
        renderCell={renderCell}
        testID={testID}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    lineHeight: 32,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1
  },
  focusCell: {
    borderColor: '#ff00af'
  }
})
