
import { StyleSheet, View } from 'react-native'
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { tailwind } from '@tailwind'

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
        key={index}
        onLayout={getCellOnLayoutHandler(index)}
        style={[styles.cell, hasValue && styles.filledCell, isFocused && styles.focusCell, index === 0 && { marginLeft: 0 }]}
        testID={`${testID}_${index}`}
      />
    )
  }
  const autofocus = true
  return (
    <View style={tailwind('flex-row justify-center mb-4')}>
      <CodeField
        ref={ref}
        {...props}
        autoFocus={autofocus}
        cellCount={cellCount}
        keyboardType='number-pad'
        onChangeText={onChange}
        renderCell={renderCell}
        testID={testID}
        textContentType='oneTimeCode'
        value={value}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'flex',
    fontSize: 20,
    fontWeight: '500',
    height: 20,
    justifyContent: 'center',
    lineHeight: 20,
    marginLeft: 25,
    paddingLeft: 1,
    paddingTop: 1,
    textAlign: 'center',
    width: 20
  },
  filledCell: {
    backgroundColor: '#ff00af',
    borderColor: '#ff00af',
    borderRadius: 10
  },
  focusCell: {
    borderColor: '#ff00af',
    borderRadius: 10
  }
})
