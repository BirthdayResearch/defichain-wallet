import { ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { StyleProp, ViewStyle } from 'react-native'
import { tailwind } from '@tailwind'

interface PortfolioButtonGroupProps {
  buttons: Buttons[]
  activeButtonGroupItem: string
  testID: string
}
interface Buttons {
  id: string
  label: string
  handleOnPress: () => void
}

export function PortfolioButtonGroup (props: PortfolioButtonGroupProps): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind('bg-gray-50')}
      style={tailwind('pl-5 mt-6 mb-4')}
    >
      <ThemedScrollViewV2 horizontal style={tailwind('py-2')}>
        {props.buttons.map((button, index) => (
          <PortfolioButtonItem
            key={button.id}
            label={button.label}
            onPress={button.handleOnPress}
            isActive={props.activeButtonGroupItem === button.id}
            testID={`${props.testID}_${button.id}`}
            additionalStyles={!(props.buttons.length === index) ? tailwind('mr-3') : undefined}
          />
      ))}
      </ThemedScrollViewV2>
    </ThemedViewV2>
  )
}

interface PortfolioButtonItemProps {
  label: string
  onPress: () => void
  isActive: boolean
  testID: string
  additionalStyles?: StyleProp<ViewStyle>
}

function PortfolioButtonItem (props: PortfolioButtonItemProps): JSX.Element {
   return (
     <ThemedTouchableOpacityV2
       onPress={props.onPress}
       dark={tailwind({ 'bg-mono-dark-v2-900 ': props.isActive, 'border border-mono-dark-v2-700': !props.isActive })}
       light={tailwind({ 'bg-mono-light-v2-900': props.isActive, 'border border-mono-light-v2-700': !props.isActive })}
       style={[tailwind('rounded-2xl text-center  py-2 px-4'), props.additionalStyles]}
       testID={`${props.testID}${props.isActive ? '_active' : ''}`}
     >
       <ThemedTextV2
         style={tailwind('font-normal-v2 text-center text-xs')}
         light={tailwind(`${props.isActive ? 'text-mono-light-v2-100' : 'text-mono-light-v2-700'}`)}
         dark={tailwind(`${props.isActive ? 'text-mono-dark-v2-100' : 'text-mono-dark-v2-700'}`)}
       >
         {props.label}
       </ThemedTextV2>
     </ThemedTouchableOpacityV2>
   )
}
