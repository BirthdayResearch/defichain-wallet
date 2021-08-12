import React from 'react'
import { StyleSheet, View } from 'react-native'
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { tailwind } from '../tailwind'

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
    const hasValue = symbol !== undefined && symbol !== ''
    return (
      <View
        testID={`${testID}_${index}`}
        key={index}
        style={[styles.cell, hasValue && styles.filledCell, isFocused && styles.focusCell, index === 0 && { marginLeft: 0 }]}
        onLayout={getCellOnLayoutHandler(index)}
      />
    )
  }

  return (
    <View style={tailwind('flex-row justify-center mb-4')}>
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
        autoFocus
      />
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: 20,
    height: 20,
    lineHeight: 20,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 25,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 1,
    paddingLeft: 1
  },
  focusCell: {
    borderColor: '#ff00af',
    borderRadius: 10
  },
  filledCell: {
    borderColor: '#ff00af',
    backgroundColor: '#ff00af',
    borderRadius: 10
  }
})
