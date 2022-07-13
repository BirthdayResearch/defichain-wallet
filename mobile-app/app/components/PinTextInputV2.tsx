
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { getColor, tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface PinTextInputItem {
  cellCount: number
  testID: string
  value: string
  onChange: (text: string) => void
  style?: StyleProp<ViewStyle> // additional styling classes
}

export interface RenderCellItem {
  index: number
  symbol: string
  isFocused: boolean
}

export function PinTextInputV2 ({ cellCount, testID, value, onChange, style }: PinTextInputItem): JSX.Element {
  const ref = useBlurOnFulfill({ value, cellCount })
  const { isLight } = useThemeContext()
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChange
  })

  const renderCell = ({ index, symbol }: RenderCellItem): JSX.Element => {
    const hasValue = symbol !== undefined && symbol !== ''
    return (
      <View
        key={index}
        onLayout={getCellOnLayoutHandler(index)}
        style={[
          styles.cell,
          isLight && styles.borderColorLight,
          !isLight && styles.borderColorDark,
          hasValue && isLight && styles.filledCellLight,
          hasValue && !isLight && styles.filledCellDark,
          index === 0 && { marginLeft: 0 }
        ]}
        testID={`${testID}_${index}`}
      />
    )
  }
  const autofocus = true
  return (
    <View style={[tailwind('flex-row justify-center'), style]}>
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
  borderColorDark: {
    borderColor: getColor('mono-dark-v2-900')
  },
  borderColorLight: {
    borderColor: getColor('mono-light-v2-900')
  },
  cell: {
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  filledCellDark: {
    backgroundColor: getColor('mono-dark-v2-900'),
    borderColor: getColor('mono-dark-v2-900'),
    borderRadius: 10
  },
  filledCellLight: {
    backgroundColor: getColor('mono-light-v2-900'),
    borderColor: getColor('mono-light-v2-900'),
    borderRadius: 10
  }
})
