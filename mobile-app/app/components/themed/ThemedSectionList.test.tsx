import { render } from '@testing-library/react-native'
import { ThemedSectionList } from './ThemedSectionList'
import { Text } from 'react-native'

jest.mock('@shared-contexts/ThemeProvider')

describe('themed section list', () => {
  it('should match snapshot with', () => {
    const rendered = render(
      <ThemedSectionList
        sections={[
          {
            title: 'Main title',
            data: ['Foo', 'Bar', 'Test']
          }
        ]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => (
          <Text>{title}</Text>
        )}
      />)
    // const rendered = render(<ThemedText>Test</ThemedText>)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
