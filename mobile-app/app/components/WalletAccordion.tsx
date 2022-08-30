import { FC, useState } from 'react'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from './themed'
import Accordion from 'react-native-collapsible/Accordion'
import { tailwind } from '@tailwind'
import { View } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

interface AccordionProps {
  testID?: string
  title: string
  content: AccordionContent[]
  activeSections?: number[] | string[]
}

export interface AccordionContent {
  title?: string
  content?: Array<{
    text: string
    type: 'bullet' | 'paragraph'
  }>
  childComponent?: FC
}

export function WalletAccordion (props: AccordionProps): JSX.Element {
  const { isLight } = useThemeContext()
  const [activeSections, setActiveSections] = useState<number[] | string[]>(props.activeSections ?? [])
  const isLastContent = (index: number): boolean => {
    return index === props.content.length - 1
  }

  return (
    <ThemedScrollView
      testID={props.testID}
    >
      <ThemedSectionTitle
        style={tailwind('mt-8 text-xs font-medium')}
        light={tailwind('text-dfxgray-400')}
        dark={tailwind('text-dfxgray-500')}
        text={props.title}
      />

      <Accordion
        containerStyle={[tailwind('border rounded-lg mt-2 overflow-hidden'), isLight ? tailwind('bg-white border-gray-200') : tailwind('bg-dfxblue-800 border-dfxblue-900')]}
        underlayColor='transparent'
        sections={props.content}
        renderHeader={(prop, index, isActive) => {
          return (
            <ThemedView
              light={tailwind('border-gray-200')}
              dark={tailwind('border-dfxblue-900')}
              style={[tailwind('p-4 flex-row items-center justify-between'), !isActive && !isLastContent(index) && tailwind('border-b'), isActive && tailwind('pb-1')]}
            >
              <ThemedText
                style={[
                  tailwind('text-sm flex-1'),
                  isActive && tailwind('font-semibold')
                ]}
                light={isActive ? tailwind('text-gray-900') : tailwind('text-dfxgray-500')}
                dark={isActive ? tailwind('text-gray-50') : tailwind('text-dfxgray-400')}
              >
                {prop.title}
              </ThemedText>
              <ThemedIcon
                iconType='MaterialIcons'
                name={isActive ? 'arrow-drop-up' : 'arrow-drop-down'}
                size={24}
                light={isActive ? tailwind('text-gray-600') : tailwind('text-dfxgray-400')}
                dark={isActive ? tailwind('text-dfxgray-300') : tailwind('text-dfxgray-500')}
              />
            </ThemedView>

          )
        }}
        renderContent={(prop, index, isActive) => {
          return (
            <ThemedView
              style={[tailwind('p-4 pt-0'), isActive && !isLastContent(index) && tailwind('border-b')]}
              light={tailwind('border-gray-200')}
              dark={tailwind('border-dfxblue-900')}
            >
              {prop.content?.map(({ text, type }) => (
                <View key={text} style={tailwind('flex-row justify-start')}>
                  {type === 'bullet' && (
                    <ThemedText style={tailwind('w-1/12 font-bold text-sm')}>{'\u2022'}</ThemedText>
                  )}
                  <ThemedText
                    key={text}
                    style={tailwind('flex-1 text-sm')}
                    light={tailwind('text-gray-600')}
                    dark={tailwind('text-dfxgray-300')}
                  >
                    {text}
                  </ThemedText>
                </View>
              ))}
              {(prop.childComponent != null) && (prop.content == null) && (
                <prop.childComponent />
              )}
            </ThemedView>
          )
        }}
        onChange={(activeSections) => {
          setActiveSections(activeSections)
        }}
        activeSections={activeSections}
      />
    </ThemedScrollView>
  )
}
