import { forwardRef, useCallback } from 'react'
import { Platform, StyleProp, Text, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useBottomSheetInternal } from '@gorhom/bottom-sheet'
import {
  ThemedViewV2,
  ThemedIcon,
  ThemedProps,
  ThemedSectionTitleV2,
  ThemedTextInputV2
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
  editable?: boolean
  inlineText?: {
    type: 'error' | 'helper'
    text?: string | JSX.Element
    style?: StyleProp<ViewStyle>
  }
  displayClearButton?: boolean
  onClearButtonPress?: () => void
  displayFocusStyle?: boolean
  containerStyle?: string
  inputContainerStyle?: StyleProp<ViewStyle>
  onBlur?: () => void
  hasBottomSheet?: boolean
  inputFooter?: React.ReactElement
  displayTickIcon?: boolean
}

export const TransactionCardWalletTextInputV2 = forwardRef<any, WalletTextInputProps>(function (props: WalletTextInputProps, ref: React.Ref<any>): JSX.Element {
  // const [isFocus, setIsFocus] = useState(false)
  const {
    title,
    titleTestID,
    valid = true,
    inlineText,
    editable = true,
    displayClearButton = false,
    onClearButtonPress,
    children,
    containerStyle,
    inputContainerStyle,
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
        <ThemedSectionTitleV2
          testID={titleTestID}
          text={title}
        />
      )}
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-00', { 'border-red-v2': !valid })}
        dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-00', { 'border-red-v2': !valid })}
        style={tailwind('flex-col w-full border-0.5 rounded-lg-v2')}
      >
        <View
          style={[tailwind('flex-row items-center py-2 pl-5 pr-3 justify-between'), props.multiline === true && { minHeight: 54 }, inputContainerStyle]}
        >
          <TextInput
            // onFocus={() => setIsFocus(true)}
            // onBlur={() => {
            //   if (onBlur !== undefined) {
            //     onBlur()
            //   }
            //   setIsFocus(false)
            // }}
            ref={ref}
            editable={editable}
            style={tailwind('font-normal-v2 flex-1 h-5')}
            selectionColor={getColor('brand-v2-500')}
            {...otherProps}
          />
          {displayTickIcon === true &&
            <MaterialIcons
              size={16}
              name='check-circle'
              iconType='MaterialIcons'
              style={tailwind('text-green-v2 ml-2')}
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
            style={[tailwind('text-xs mt-2 text-red-v2 font-normal-v2'), inlineText.style]}
            testID={props.testID !== undefined ? `${props.testID}_error` : undefined}
          >
            {inlineText?.text}
          </Text>
      }
      {inlineText?.type === 'helper' && typeof inlineText?.text === 'string' &&
        <Text
          style={[tailwind('text-xs text-red-v2 mt-2 font-normal-v2'), inlineText.style]}
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
      style={tailwind('flex flex-row items-center bg-transparent ml-2')}
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
    <ThemedTextInputV2
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
    <ThemedTextInputV2
      keyboardType={inputType}
      ref={ref}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      {...otherProps}
    />
  )
})
