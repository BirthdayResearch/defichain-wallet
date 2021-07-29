import { MaterialIcons } from '@expo/vector-icons'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TextInput, TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { View } from '.'
import { Text } from './Text'

interface PinInputOptions {
  length: 4 | 6 // should be easy to support 4-8 numeric, fix it to 4 or 6 first
  onChange: (text: string) => void
  disabled?: boolean
}

/**
 * JSX component to collect 4 or 6 digit pin
 *
 * @param {PinInputOptions} props
 * @param {4|6} props.length pin length
 * @param {(text: string) => void} props.onChange on triggered when user input reach `length`, clear input after fired
 * @param {boolean} disabled
 */
export function PinInput ({ length, onChange, disabled }: PinInputOptions): JSX.Element {
  const [text, setText] = useState<string>('')
  const _textInput = useRef<TextInput | null>(null)

  const focus = useCallback(() => {
    _textInput.current?.focus()
  }, [_textInput, _textInput?.current])

  // CAUTION: as digit box is meant to display same length as an invisible textinput value
  // should be used side by side with setText('')
  const clear = useCallback(() => {
    focus()
    _textInput.current?.clear()
  }, [_textInput, _textInput?.current, focus])

  useEffect(() => {
    if (text.length === length) {
      // allow UI thread to complete painting before attempt heavy async task in callback
      setTimeout(() => {
        clear()
        setText('')
        onChange(text)
      }, 100)
    }
  }, [text, clear])

  const digitBoxes = (): JSX.Element => {
    const arr = []
    for (let i = 0; i < length; i++) {
      let child: JSX.Element | null = null
      if (text.length > i) {
        child = <MaterialIcons name='circle' size={15} color='black' />
        if (text.length - 1 === i) {
          child = <Text>{text[i]}</Text>
        }
      }
      arr.push(
        <View key={i} style={tailwind('h-8 w-8 items-center justify-center border border-gray-500 rounded p-2 m-2')}>
          {child}
        </View>
      )
    }
    return (
      <View style={tailwind('h-12 flex-row justify-center items-center')}>{arr}</View>
    )
  }

  return (
    <TouchableOpacity onPress={() => focus()}>
      {digitBoxes()}
      <TextInput
        editable={disabled === undefined ? true : !disabled}
        ref={ref => { _textInput.current = ref }}
        style={tailwind('opacity-0 h-0')}
        keyboardType='numeric'
        secureTextEntry
        autoFocus
        maxLength={length}
        onChangeText={txt => { setText(txt) }}
      />
    </TouchableOpacity>
  )
}
