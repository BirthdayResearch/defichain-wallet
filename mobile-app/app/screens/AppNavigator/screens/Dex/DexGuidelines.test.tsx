import { render, waitFor } from '@testing-library/react-native'
import * as React from 'react'
import { DexGuidelines } from './DexGuidelines'

jest.mock('@shared-contexts/ThemeProvider', () => ({
  useThemeContext: () => {
    return {
      isLight: true
    }
  }
}))

describe('Dex guide', () => {
  it('should match snapshot', async () => {
    const onClose = jest.fn
    const rendered = render(
      <DexGuidelines onClose={onClose} />
    )
    await waitFor(() => rendered.toJSON() !== null)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
