import { render } from "@testing-library/react-native";
import * as React from 'react'
import { getTokenIcon } from "./_index";

const icons = ['DFI', 'FAKE', 'BCH', 'BTC', 'DOGE', 'ETH', 'LTC', 'USDT', '_UTXO']

describe('token icons', () => {
  icons.forEach(icon => {
    it(`getTokenIcon("${icon}") should get <Icon${icon} /> snapshot`, () => {
      const Icon = getTokenIcon(icon)
      const tree = render(<Icon />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
});
