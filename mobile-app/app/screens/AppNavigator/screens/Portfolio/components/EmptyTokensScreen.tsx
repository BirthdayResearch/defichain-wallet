import { tailwind } from '@tailwind'
import { ThemedTextV2 } from '@components/themed'
import { View } from '@components'
import { translate } from '@translations'
import { EmptyPortfolioIcon } from '../assets/EmptyPortfolioIcon'
import { EmptyDTokenIcon } from '../assets/EmptyDTokenIcon'
import { EmptyLPTokenIcon } from '../assets/EmptyLPTokenIcon'
import { EmptyCryptoIcon } from '../assets/EmptyCryptoIcon'
import { ButtonGroupTabKey } from './AssetsFilterRow'

interface EmptyBalancesProps {
  type?: ButtonGroupTabKey
}

export function EmptyTokensScreen (props: EmptyBalancesProps): JSX.Element {
  const { Icon, title, subTitle } = getEmptyScreenDetails(props?.type)
  return (
    <View
      style={tailwind('flex px-15 mt-8 mb-4 text-center bg-transparent')}
      testID='empty_portfolio'
    >
      <View style={tailwind('items-center mt-3')}>
        <Icon />
      </View>
      <ThemedTextV2
        testID='empty_tokens_title'
        style={tailwind('text-xl font-semibold-v2 text-center mt-8')}
      >
        {translate('components/EmptyPortfolio', title)}
      </ThemedTextV2>
      <ThemedTextV2
        testID='empty_tokens_subtitle'
        style={tailwind('text-base font-normal-v2 text-center mt-2')}
      >
        {translate('components/EmptyPortfolio', subTitle)}
      </ThemedTextV2>
    </View>
  )
}

function getEmptyScreenDetails (type?: ButtonGroupTabKey): { Icon: () => JSX.Element, title: string, subTitle: string } {
  switch (type) {
    case ButtonGroupTabKey.Crypto:
      return {
        Icon: EmptyCryptoIcon,
        title: 'No crypto found',
        subTitle: 'Add crypto to get started'
      }
    case ButtonGroupTabKey.LPTokens:
      return {
        Icon: EmptyLPTokenIcon,
        title: 'No LP tokens found',
        subTitle: 'Add liquidity to get started'
      }
    case ButtonGroupTabKey.dTokens:
      return {
        Icon: EmptyDTokenIcon,
        title: 'No dTokens found',
        subTitle: 'Mint dTokens to get started'
      }
    case ButtonGroupTabKey.AllTokens:
    default:
      return {
        Icon: EmptyPortfolioIcon,
        title: 'Empty portfolio',
        subTitle: 'Add DFI and other tokens to get started'
      }
  }
}
