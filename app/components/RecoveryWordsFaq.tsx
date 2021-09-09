import { translate } from '@translations'
import React, { useState } from 'react'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from './themed'
import Accordion from 'react-native-collapsible/Accordion'
import { tailwind } from '@tailwind'
interface ActiveSessions {
  activeSessions: number[] | string[]
}
export function RecoveryWordFaq (): JSX.Element {
  const initialContent: ActiveSessions = {
    activeSessions: []
  }
  const [activeContent, setActiveContent] = useState(initialContent)

  // TODO(kyleleow): update content
  const faqContent = [
    {
      title: 'title 1',
      content: 'content 1'
    },
    {
      title: 'title 2',
      content: 'content 2'
    }
  ]

  // TODO(kyleleow): update border UI and darkmode UI
  return (
    <ThemedScrollView
      style={tailwind('p-6')}
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('components/RecoveryWordFaq', 'Recovery words')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-2 text-sm')}
      >
        {translate('components/RecoveryWordFaq', 'Your unique 24 recovery words is a human-readable representation of your wallet private key, generated from a list of 2048 words in the BIP-39 standard. It prevents any attempts on brute-hacking your wallet’s security.')}
      </ThemedText>

      <ThemedText
        style={tailwind('mt-8 text-xs font-medium')}
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
      >
        {translate('components/RecoveryWordFaq', 'FREQUENTLY ASKED QUESTIONS')}
      </ThemedText>

      <Accordion
        containerStyle={tailwind('border border-gray-200 bg-white rounded-lg mt-2')}
        sectionContainerStyle={tailwind('border-b border-gray-200 p-4')}
        sections={faqContent}
        renderHeader={(prop, _index, isActive) => {
          return (
            <ThemedView
              light={tailwind('bg-transparent')}
              style={tailwind('flex-row items-center justify-between')}
            >
              <ThemedText
                style={[
                  tailwind('text-sm'),
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
        renderContent={(prop) => {
          return (
            <ThemedText
              style={tailwind('mt-2 text-sm text-gray-600')}
            >
              {prop.content}
            </ThemedText>
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
