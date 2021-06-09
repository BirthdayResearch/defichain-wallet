import React, { ReactElement } from 'react'
import { Text, View } from '../../components/Themed'
import tailwind from 'tailwind-rn'
import { translate } from '../../translations'

interface Props {
  children: ReactElement
}

interface State {
  hasError: boolean
}

export function ErrorDisplayComponent (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/ErrorBoundary', 'Something went wrong')}
      </Text>
    </View>
  )
}

class ErrorBoundary extends React.Component<Props, State> {
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
