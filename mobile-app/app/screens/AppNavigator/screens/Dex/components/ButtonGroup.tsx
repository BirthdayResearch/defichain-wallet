import { ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle } from 'react-native'

interface ButtonGroupProps {
  buttons: Buttons[]
  activeButtonGroupItem: string
  testID: string
  modalStyle?: StyleProp<TextStyle>
  lightThemeStyle?: { [key: string]: string }
  darkThemeStyle?: { [key: string]: string }
  portfolioButtonGroupStyle?: { [key: string]: string }
  portfolioLightActiveStyle?: boolean
  portfoliolDarkActiveStyle?: boolean
}

interface Buttons {
  id: string
  label: string
  handleOnPress: () => void
}

export function ButtonGroup (props: ButtonGroupProps): JSX.Element {
  const buttonWidth = new BigNumber(100).dividedBy(props.buttons.length)
  return (
    <ThemedView
      light={props.lightThemeStyle ?? tailwind('bg-gray-100')}
      dark={props.darkThemeStyle ?? tailwind('bg-gray-800')}
      style={tailwind('rounded-2xl flex flex-row')}
      testID={props.testID}
    >
      {
        props.buttons.map((button) => (
          <ButtonGroupItem
            label={button.label}
            onPress={button.handleOnPress}
            isActive={props.activeButtonGroupItem === button.id}
            width={buttonWidth}
            key={button.id}
            testID={`${props.testID}_${button.id}`}
            modalStyle={props.modalStyle}
            portfolioButtonGroupStyle={props.portfolioButtonGroupStyle}
            portfolioLightActiveStyle={props.portfolioLightActiveStyle}
            portfoliolDarkActiveStyle={props.portfoliolDarkActiveStyle}
          />
        ))
      }
    </ThemedView>
  )
}

interface ButtonGroupItemProps {
  label: string
  onPress: () => void
  isActive: boolean
  width: BigNumber
  testID: string
  modalStyle?: StyleProp<TextStyle>
  portfolioButtonGroupStyle?: { [key: string]: string }
  portfolioLightActiveStyle?: boolean
  portfoliolDarkActiveStyle?: boolean
}

function ButtonGroupItem (props: ButtonGroupItemProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      light={tailwind(
        {
          'bg-primary-50': props.isActive
        },
        {
          'bg-gray-100': props.isActive && props.portfolioLightActiveStyle !== undefined
        }
        )}
      dark={tailwind(
        { 'bg-darkprimary-50': props.isActive },
        {
          'bg-black': props.isActive && props.portfoliolDarkActiveStyle !== undefined
        })}
      style={props.portfolioButtonGroupStyle ?? [tailwind(['rounded-2xl break-words justify-center py-2 px-3']), { width: `${props.width.toFixed(2)}%` }]}
      testID={`${props.testID}${props.isActive ? '_active' : ''}`}
    >
      <ThemedText
        light={tailwind({ 'text-primary-500': props.isActive, 'text-gray-900': !props.isActive })}
        dark={tailwind({ 'text-darkprimary-500': props.isActive, 'text-gray-50': !props.isActive })}
        style={props.modalStyle ?? tailwind('font-medium text-sm text-center')}
      >
        {props.label}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
