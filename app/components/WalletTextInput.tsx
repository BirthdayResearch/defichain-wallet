import React, { useState } from 'react'
import { TextInputProps } from 'react-native'
import { ThemedView, ThemedText, ThemedTextInput, ThemedTouchableOpacity, ThemedIcon, ThemedSectionTitle } from '@components/themed'
import { tailwind } from '@tailwind'

type WalletTextInputProps = React.PropsWithChildren<TextInputProps> & IWalletTextInputProps
export type InputType = 'default' | 'numeric'

interface IWalletTextInputProps {
  inputType: InputType
  title?: string
  titleTestID?: string
  valid?: boolean
  inlineValidationText?: string
  displayClearButton?: boolean
  onClearButtonPress?: () => void
  displayFocusStyle?: boolean
}

export function WalletTextInput (props: WalletTextInputProps): JSX.Element {
  const [isFocus, setIsFocus] = useState(false)
  const {
    inputType,
    title,
    titleTestID,
    valid,
    inlineValidationText,
    displayClearButton = false,
    onClearButtonPress,
    children,
    style,
    ...otherProps
  } = props

  const isInvalid = (): boolean => {
    return valid === false
  }
  const hasInlineValidation = (): boolean => {
    return inlineValidationText !== undefined
  }
  const hasClearButton = (): boolean => {
    return (displayClearButton) && (onClearButtonPress !== undefined)
  }

  return (
    <ThemedView
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind('flex-col w-full')}
    >
      {title !== undefined &&
        <ThemedSectionTitle
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
          testID={titleTestID}
          text={title}
          style={tailwind('text-base')}
        />}
      <ThemedView
        light={tailwind(`bg-white ${isInvalid() ? 'border-error-500' : (isFocus ? 'border-primary-300' : 'border-gray-300')}`)}
        dark={tailwind(`bg-gray-800 ${isInvalid() ? 'border-darkerror-500' : (isFocus ? 'border-darkprimary-300' : 'border-gray-600')}`)}
        style={tailwind('flex-col w-full border rounded mt-2')}
      >
        <ThemedView
          light={tailwind('bg-transparent')}
          dark={tailwind('bg-transparent')}
          style={tailwind('flex-row items-center p-2')}
        >
          <ThemedTextInput
            style={style}
            onFocus={() => setIsFocus(true)}
            onBlur={() => {
              setIsFocus(false)
            }}
            keyboardType={inputType}
            {...otherProps}
          />
          {hasClearButton() && <ClearButton onPress={onClearButtonPress} />}
          {children}
        </ThemedView>
      </ThemedView>
      {
        hasInlineValidation() &&
          <ThemedText
            light={tailwind('text-error-500')}
            dark={tailwind('text-darkerror-500')}
            style={tailwind('text-sm my-1')}
          >
            {inlineValidationText}
          </ThemedText>
      }
    </ThemedView>
  )
}

function ClearButton (props: {onPress?: () => void}): JSX.Element {
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-gray-800')}
      dark={tailwind('bg-gray-100')}
      style={tailwind('mx-2 border-0 rounded-full')}
      onPress={props.onPress}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='cancel'
        size={24}
        light={tailwind('text-gray-100')}
        dark={tailwind('text-gray-800')}
        style={tailwind('-m-1')}
      />
    </ThemedTouchableOpacity>
  )
}
