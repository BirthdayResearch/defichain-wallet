import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { NumberRow } from './NumberRow'

jest.mock('@shared-contexts/ThemeProvider')

describe('Number row', () => {
  it('should match snapshot for text suffix', () => {
    const rendered = render(
      <NumberRow
        lhs='foo'
        rhs={{
          value: 100,
          suffixType: 'text',
          suffix: '$',
          testID: 'foo_test'
        }}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for component suffix', () => {
    const rendered = render(
      <NumberRow
        lhs='foo'
        rhs={{
          value: 100,
          suffixType: 'component',
          testID: 'foo_test'
        }}
      >
        <Text>$</Text>
      </NumberRow>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
