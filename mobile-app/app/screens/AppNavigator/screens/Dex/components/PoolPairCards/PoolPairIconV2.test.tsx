import { render } from '@testing-library/react-native'
import { PoolPairIconV2 } from './PoolPairIconV2'

describe('Pool pair icon component', () => {
  it('should match snapshot with 2 token', async () => {
    const rendered = render(<PoolPairIconV2 symbolA='dBTC' symbolB='DFI' customSize={36} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
