import { render } from '@testing-library/react-native'
import { KnowledgeBaseScreenV2 } from './KnowledgeBaseScreenV2'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')

describe('knowledge base V2 screen', () => {
  it('should render', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const rendered = render(<KnowledgeBaseScreenV2 navigation={navigation} route={route} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
