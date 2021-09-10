import { translate } from '@translations'
import React, { useState } from 'react'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from './themed'
import Accordion from 'react-native-collapsible/Accordion'
import { tailwind } from '@tailwind'
import { useThemeContext } from '@contexts/ThemeProvider'

interface ActiveSessions {
  activeSessions: number[] | string[]
}

export function RecoveryWordFaq (): JSX.Element {
  const { isLight } = useThemeContext()
  const initialContent: ActiveSessions = {
    activeSessions: []
  }
  const [activeContent, setActiveContent] = useState(initialContent)
  const faqContent = [
    {
      title: translate('components/RecoveryWordFaq', 'What happens if I lose my recovery words?'),
      content: translate('components/RecoveryWordFaq', 'Once you lose your recovery words, you will not be able to restore your wallet and any funds within it. We encourage you to be responsible with your recovery words.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can I use the 24-word from xxx that I created from xxx?'),
      content: translate('components/RecoveryWordFaq', 'No, reusing 24-word from another computer, phone tablet, software, hardware, wallet provider will only be as secure as where you re-used it from.\n\nYou can only trust the 24-word if you can trust the device/app that generated it.\n\nYou must only enter the 24-word into a device that you trust isn\'t tamper with.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Can someone help me if I lose my recovery words?'),
      content: translate('components/RecoveryWordFaq', 'No. You are the only one who has the access to your recovery words. No one is responsible and liable for it except you.')
    },
    {
      title: translate('components/RecoveryWordFaq', 'Why is it recommended to keep my recovery words offline and in paper?'),
      content: translate('components/RecoveryWordFaq', 'Storing it in digital networks could make it accessible to hackers. It is best to write it in paper and to keep it secure and private.')
    }
  ]
  const isLastContent = (index: number): boolean => {
    return index === faqContent.length - 1
  }

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
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
        containerStyle={[tailwind('border rounded-lg mt-2 overflow-hidden'), isLight ? tailwind('bg-white border-gray-200') : tailwind('bg-black border-gray-700')]}
        sectionContainerStyle={isLight ? tailwind('border-gray-200') : tailwind('border-gray-700')}
        underlayColor='transparent'
        sections={faqContent}
        renderHeader={(prop, _index, isActive) => {
          return (
            <ThemedView
              light={tailwind('bg-white border-gray-200')}
              dark={tailwind('border-gray-700')}
              style={[tailwind('p-4 flex-row items-center justify-between'), !isActive && !isLastContent(_index) && tailwind('border-b'), isActive && tailwind('pb-1')]}
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
        renderContent={(prop, _index, isActive) => {
          return (
            <ThemedView
              style={[tailwind('p-4 pt-0'), isActive && !isLastContent(_index) && tailwind('border-b')]}
              light={tailwind('bg-transparent border-gray-200')}
              dark={tailwind('border-gray-700')}
            >
              <ThemedText
                style={tailwind('text-sm text-gray-600')}
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
