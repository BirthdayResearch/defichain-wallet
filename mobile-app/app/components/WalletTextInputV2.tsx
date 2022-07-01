import { forwardRef, useCallback, useState } from 'react'
import { Platform, Text, TextInputProps, TouchableOpacity, View } from 'react-native'
import { useBottomSheetInternal } from '@gorhom/bottom-sheet'
import {
  ThemedViewV2,
  ThemedTextInput,
  ThemedIcon,
  ThemedProps,
  ThemedSectionTitleV2
} from '@components/themed'
import { getColor, tailwind } from '@tailwind'
import { MaterialIcons } from '@expo/vector-icons'

type WalletTextInputProps = React.PropsWithChildren<TextInputProps> & IWalletTextInputProps
export type InputType = 'default' | 'numeric'

interface IWalletTextInputProps {
  inputType: InputType
  title?: string
  titleTestID?: string
  valid?: boolean
  inlineText?: {
    type: 'error' | 'helper'
    text?: string | JSX.Element
  }
  displayClearButton?: boolean
  onClearButtonPress?: () => void
  displayFocusStyle?: boolean
  containerStyle?: string
  onBlur?: () => void
  hasBottomSheet?: boolean
  inputFooter?: React.ReactElement
  displayTickIcon?: boolean
}

export const WalletTextInputV2 = forwardRef<any, WalletTextInputProps>(function (props: WalletTextInputProps, ref: React.Ref<any>): JSX.Element {
  const [isFocus, setIsFocus] = useState(false)
  const {
    title,
    titleTestID,
    valid = true,
    inlineText,
    displayClearButton = false,
    onClearButtonPress,
    children,
    containerStyle,
    onBlur,
    hasBottomSheet,
    inputFooter,
    displayTickIcon,
    ...otherProps
  } = props

  const textInputComponents = {
    ios: TextInputIOS,
    default: TextInputDefault
  }
  const TextInput = Platform.OS === 'ios' && hasBottomSheet === true ? textInputComponents.ios : textInputComponents.default

  const hasClearButton = (): boolean => {
    return (displayClearButton) && (onClearButtonPress !== undefined)
  }

  return (
    <ThemedViewV2
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind(`${containerStyle ?? 'w-full flex-col'}`)}
    >
      {title !== undefined &&
      (
        <View style={tailwind('flex flex-row justify-between items-center')}>
          <ThemedSectionTitleV2
            testID={titleTestID}
            text={title}
            style={tailwind('text-base font-normal-v2')}
          />
        </View>
        )}
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-00', { 'border-mono-light-v2-800': isFocus, 'border-red-v2': !valid })}
        dark={tailwind('bg-mono-dark-v2-00 border-mono-light-v2-00', { 'border-mono-dark-v2-800': isFocus, 'border-red-v2': !valid })}
        style={tailwind('flex-col w-full border-0.5 rounded-2lg')}
      >
        <View
          style={[tailwind('flex-row items-center py-2 pl-5 pr-3 justify-between bg-transparent'), props.multiline === true && { minHeight: 54 }]}
        >
          <TextInput
            onFocus={() => setIsFocus(true)}
            onBlur={() => {
              if (onBlur !== undefined) {
                onBlur()
              }
              setIsFocus(false)
            }}
            ref={ref}
            editable
            style={tailwind('font-normal-v2 flex-1')}
            selectionColor={getColor('brand-v2-500')}
            {...otherProps}
          />
          {displayTickIcon === true &&
            <MaterialIcons
              size={18}
              name='check'
              iconType='MaterialIcons'
              style={tailwind('text-green-v2')}
              testID={props.testID !== undefined ? `${props.testID}_check_button` : undefined}
            />}
          {
            hasClearButton() &&
              <ClearButtonV2
                onPress={onClearButtonPress}
                testID={props.testID !== undefined ? `${props.testID}_clear_button` : undefined}
              />
          }
          {children}
        </View>
        <View>
          {inputFooter}
        </View>
      </ThemedViewV2>
      {
        inlineText?.type === 'error' && !valid &&
          <Text
            style={tailwind('text-xs mt-2 text-red-v2 font-normal-v2')}
            testID={props.testID !== undefined ? `${props.testID}_error` : undefined}
          >
            {inlineText?.text}
          </Text>
      }
      {inlineText?.type === 'helper' && typeof inlineText?.text === 'string' &&
        <Text
          style={tailwind('text-xs text-red-v2 mt-2 font-normal-v2')}
          testID={props.testID !== undefined ? `${props.testID}_error` : undefined}
        >
          {inlineText?.text}
        </Text>}

      {inlineText?.type === 'helper' && typeof inlineText?.text !== 'string' && inlineText?.text}

    </ThemedViewV2>
  )
})

export function ClearButtonV2 (props: {onPress?: () => void, testID?: string, iconThemedProps?: ThemedProps}): JSX.Element {
  return (
    <TouchableOpacity
      testID={props.testID}
      style={tailwind('flex flex-row items-center bg-transparent')}
      onPress={props.onPress}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='cancel'
        size={18}
        light={{ color: '#8E8E93' }}
        dark={{ color: '#8E8E93' }}
        {...props.iconThemedProps}
      />
    </TouchableOpacity>
  )
}

const TextInputDefault = forwardRef((props: WalletTextInputProps, ref: React.Ref<any>) => {
  const {
    inputType,
    ...otherProps
  } = props
  return (
    <ThemedTextInput
      keyboardType={inputType}
      ref={ref}
      {...otherProps}
    />
  )
})

const TextInputIOS = forwardRef((props: WalletTextInputProps, ref: React.Ref<any>) => {
  const {
    inputType,
    onBlur,
    onFocus,
    ...otherProps
  } = props
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal()
  const handleOnFocus = useCallback(
    (e) => {
      shouldHandleKeyboardEvents.value = true

      if (onFocus !== undefined) {
        onFocus(e)
      }
    },
    [shouldHandleKeyboardEvents]
  )
  const handleOnBlur = useCallback(
    () => {
      shouldHandleKeyboardEvents.value = true

      if (onBlur !== undefined) {
        onBlur()
      }
    },
    [shouldHandleKeyboardEvents]
  )

  return (
    <ThemedTextInput
      keyboardType={inputType}
      ref={ref}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      {...otherProps}
    />
  )
})
