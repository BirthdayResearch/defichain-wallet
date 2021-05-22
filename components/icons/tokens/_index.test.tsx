import * as React from 'react'
import renderer from 'react-test-renderer'
import { getTokenIcon } from "./_index";

it('getTokenIcon("DFI") should get <IconDFI /> snapshot', () => {
  const Icon = getTokenIcon('DFI')
  const tree = renderer.create(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("FAKE") should get <IconDefault /> snapshot', () => {
  const Icon = getTokenIcon('FAKE')
  expect(Icon).toMatchSnapshot()
})
