import React, { useState } from 'react'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView, ThemedSectionTitle } from './themed'
import Accordion from 'react-native-collapsible/Accordion'
import { tailwind } from '@tailwind'
import { useThemeContext } from '@contexts/ThemeProvider'

interface AccordionProps {
  testID?: string
  title: string
  content: AccordionContent[]
}

export interface AccordionContent {
  title: string
  content: string
}

interface ActiveSessions {
  activeSessions: number[] | string[]
}

export function WalletAccordion (props: AccordionProps): JSX.Element {
  const { isLight } = useThemeContext()
  const initialContent: ActiveSessions = {
    activeSessions: []
  }
  const [activeContent, setActiveContent] = useState(initialContent)
  const isLastContent = (index: number): boolean => {
    return index === props.content.length - 1
  }

  return (
    <ThemedScrollView
      testID={props.testID}
    >
      <ThemedSectionTitle
        style={tailwind('mt-8 text-xs font-medium')}
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        text={props.title}
      />

      <Accordion
        containerStyle={[tailwind('border rounded-lg mt-2 overflow-hidden'), isLight ? tailwind('bg-white border-gray-200') : tailwind('bg-black border-gray-700')]}
        underlayColor='transparent'
        sections={props.content}
        renderHeader={(prop, index, isActive) => {
          return (
            <ThemedView
              light={tailwind('border-gray-200')}
              dark={tailwind('border-gray-700')}
              style={[tailwind('p-4 flex-row items-center justify-between'), !isActive && !isLastContent(index) && tailwind('border-b'), isActive && tailwind('pb-1')]}
            >
              <ThemedText
                style={[
                  tailwind('text-sm flex-1'),
                  isActive && tailwind('font-semibold')
                ]}
                light={isActive ? tailwind('text-gray-900') : tailwind('text-gray-500')}
                dark={isActive ? tailwind('text-gray-50') : tailwind('text-gray-400')}
              >
                {prop.title}
              </ThemedText>
              <ThemedIcon
                iconType='MaterialIcons'
                name={isActive ? 'arrow-drop-up' : 'arrow-drop-down'}
                size={24}
                light={isActive ? tailwind('text-gray-600') : tailwind('text-gray-400')}
                dark={isActive ? tailwind('text-gray-300') : tailwind('text-gray-500')}
              />
            </ThemedView>

          )
        }}
        renderContent={(prop, index, isActive) => {
          return (
            <ThemedView
              style={[tailwind('p-4 pt-0'), isActive && !isLastContent(index) && tailwind('border-b')]}
              light={tailwind('border-gray-200')}
              dark={tailwind('border-gray-700')}
            >
              <ThemedText
                style={tailwind('text-sm')}
                light={tailwind('text-gray-600')}
                dark={tailwind('text-gray-300')}
              >
                {prop.content}
              </ThemedText>
            </ThemedView>
          )
        }}
        onChange={(activeSessions) => {
          setActiveContent({ activeSessions })
        }}
        activeSections={activeContent.activeSessions}
      />
    </ThemedScrollView>
  )
}
