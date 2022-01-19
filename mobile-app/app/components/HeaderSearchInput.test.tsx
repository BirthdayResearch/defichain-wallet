import { render } from '@testing-library/react-native'
import { HeaderSearchInput } from './HeaderSearchInput'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 100 })
}))

describe('Header search input', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <HeaderSearchInput
        onCancelPress={jest.fn()}
        onChangeInput={jest.fn()}
        onClearInput={jest.fn()}
        placeholder='Search'
        searchString=''
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
