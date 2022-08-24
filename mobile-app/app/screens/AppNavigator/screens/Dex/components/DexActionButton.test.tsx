import { render } from '@testing-library/react-native'
import { DexActionButton, DexAddRemoveLiquidityButton } from './DexActionButton'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Dex Action Buttons', () => {
  it('<DexActionButton /> - should match snapshot', () => {
    const onPress = jest.fn()

    const rendered = render(<DexActionButton testID='Composite_Swap_2' onPress={() => onPress()} label='Swap' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('<DexAddRemoveLiquidityButton /> - should match snapshot', () => {
    const onAdd = jest.fn()
    const onRemove = jest.fn()

    const rendered = render(<DexAddRemoveLiquidityButton onAdd={() => onAdd()} onRemove={() => onRemove()} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
