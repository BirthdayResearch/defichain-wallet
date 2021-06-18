import * as React from 'react'
import { getTokenIcon } from "./_index";
import { render } from "@testing-library/react-native";

it('getTokenIcon("DFI") should get <IconDFI /> snapshot', () => {
  const Icon = getTokenIcon('DFI')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("FAKE") should get <IconDefault /> snapshot', () => {
  const Icon = getTokenIcon('FAKE')
  expect(Icon).toMatchSnapshot()
})

it('getTokenIcon("BCH") should get <IconBCH /> snapshot', () => {
  const Icon = getTokenIcon('BCH')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("BTC") should get <IconBTC /> snapshot', () => {
  const Icon = getTokenIcon('BTC')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("DOGE") should get <IconDOGE /> snapshot', () => {
  const Icon = getTokenIcon('DOGE')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("ETH") should get <IconETH /> snapshot', () => {
  const Icon = getTokenIcon('ETH')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("LTC") should get <IconLTC /> snapshot', () => {
  const Icon = getTokenIcon('LTC')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("USDT") should get <IconUSDT /> snapshot', () => {
  const Icon = getTokenIcon('USDT')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})
