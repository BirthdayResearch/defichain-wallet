import * as React from 'react'

import { Text, TextProps } from './Themed'

/**
 * TODO(fuxingloh): deprecate this MonoText, using Tailwind-RN
 */
export function MonoText (props: TextProps): JSX.Element {
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
}
