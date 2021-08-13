import React, { PropsWithChildren } from 'react'
import { Text, View } from '../../components'
import { AppIcon } from '../../components/icons/AppIcon'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

function ErrorScreen (): JSX.Element {
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

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor (props: PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError (): ErrorBoundaryState {
    return { hasError: true }
  }

  render (): JSX.Element {
    if (this.state.hasError) {
      return <ErrorScreen />
    }

    return (
      <>
        {this.props.children}
      </>
    )
  }
}
