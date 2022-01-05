import { Component, ReactElement } from 'react'
import { Text, View } from '../../components'
import { AppIcon } from '@components/icons/AppIcon'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

interface Props {
  children: ReactElement
}

interface State {
  hasError: boolean
}

export function ErrorDisplayComponent (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center p-4')}>
      <AppIcon />

      <Text style={tailwind('text-xl font-bold mt-3')}>
        {translate('screens/ErrorBoundary', 'Something went wrong')}
      </Text>

      <Text style={tailwind('text-sm text-gray-400 font-bold mt-3 text-center')}>
        {translate('screens/ErrorBoundary', 'The app ran into a problem and could not recover. Please restart your application.')}
      </Text>
    </View>
  )
}

class ErrorBoundary extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError (): State {
    return { hasError: true }
  }

  render (): JSX.Element {
    return this.state.hasError
      ? <ErrorDisplayComponent />
      : this.props.children
  }
}

export default ErrorBoundary
