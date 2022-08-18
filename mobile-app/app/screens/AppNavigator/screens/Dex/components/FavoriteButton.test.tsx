import { render } from '@testing-library/react-native'
import { FavoriteButton } from './FavoriteButton'

jest.mock('@shared-contexts/ThemeProvider')

describe('Favorite Button', () => {
  it('should match snapshot', () => {
    const setFavoritePoolPair = jest.fn()
    const isFavorite = true
    const rendered = render(<FavoriteButton pairId='1' setFavouritePoolpair={setFavoritePoolPair} isFavouritePair={isFavorite} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
