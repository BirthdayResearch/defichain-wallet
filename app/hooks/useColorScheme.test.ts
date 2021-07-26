import { useColorScheme } from "./useColorScheme";
import { useColorScheme as getScheme } from "./useColorScheme.web";

it('should test useColorScheme', () => {
  expect(useColorScheme()).toStrictEqual('light')
})

it('should test useColorScheme', () => {
  expect(getScheme()).toStrictEqual('light')
})
