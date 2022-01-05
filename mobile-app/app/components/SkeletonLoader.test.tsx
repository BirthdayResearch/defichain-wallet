import { render } from '@testing-library/react-native'
import { SkeletonLoader, SkeletonLoaderScreen } from './SkeletonLoader'

jest.mock('@shared-contexts/ThemeProvider')

describe('Skeleton loader', () => {
  const skeletonLoaders = [
    SkeletonLoaderScreen.Dex,
    SkeletonLoaderScreen.Address,
    SkeletonLoaderScreen.BrowseAuction,
    SkeletonLoaderScreen.Loan,
    SkeletonLoaderScreen.MnemonicWord,
    SkeletonLoaderScreen.Transaction,
    SkeletonLoaderScreen.Vault
  ]

  skeletonLoaders.forEach((eachLoader) => {
    it(`should match snapshot for ${eachLoader}`, () => {
      const rendered = render(
        <SkeletonLoader
          row={1}
          screen={eachLoader}
        />
      )
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
