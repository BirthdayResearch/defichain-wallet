import { render } from '@testing-library/react-native'
import { KnowledgeBaseScreen } from './KnowledgeBaseScreen'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')

describe('knowledge base screen', () => {
  it('should render', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const rendered = render(<KnowledgeBaseScreen navigation={navigation} route={route} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
