import * as React from 'react'
import renderer from 'react-test-renderer'

import { MonoText } from './StyledText'

it('<MonoText/> snapshot', () => {
  const tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON()

  expect(tree).toMatchSnapshot()
})
