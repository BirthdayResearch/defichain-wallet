import { Component, ReactElement } from 'react'
import { Text, View } from '../../components'
import { AppIcon } from '@components/icons/AppIcon'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Logging } from '@api'

interface Props {
  children: ReactElement
}

interface State {
  hasError: boolean
}

export function ErrorDisplayComponent (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center p-4 bg-dfxblue-900')}>
      <AppIcon />

      <Text style={tailwind('text-xl text-white font-bold mt-3')}>
        {translate('screens/ErrorBoundary', 'Something went wrong')}
      </Text>

      <Text style={tailwind('text-sm text-dfxgray-400 font-bold mt-3 text-center')}>
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

  componentDidCatch (error: any, errorInfo: any): any {
    // You can also log the error to an error reporting service
    Logging.error(error)
    Logging.error(errorInfo)
  }

  render (): JSX.Element {
    return this.state.hasError
      ? <ErrorDisplayComponent />
      : this.props.children
  }
}

export default ErrorBoundary
