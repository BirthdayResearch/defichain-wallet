import { render } from "@testing-library/react-native";
import * as React from 'react'
import { AppIcon } from "../AppIcon";
import { getAssetIcon } from "./index";

jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))

const icons = ['DFI', 'FAKE', 'BCH', 'BTC', 'DOGE', 'ETH', 'LTC', 'USDT', '_UTXO', 'USDC']

describe('token icons', () => {
  icons.forEach(icon => {
    it(`getAssetIcon("${icon}") should get <Icon${icon} /> snapshot`, () => {
      const Icon = getAssetIcon(icon)
      const tree = render(<Icon />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it(`<AppIcon /> should match snapshot`, () => {
    const tree = render(<AppIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })
});
