import { render } from "@testing-library/react-native";
import * as React from "react";
import { IconButton } from "./IconButton";
import { IconName } from "./themed";

const buttonName: IconName[] = ["swap-vert", "swap-horiz", "add", "remove"];

jest.mock("@shared-contexts/ThemeProvider");

describe("icon button", () => {
  buttonName.forEach((name) => {
    it(`should match snapshot of button with ${name} icon`, async () => {
      const onPress = jest.fn();
      const rendered = render(
        <IconButton
          iconName={name}
          iconSize={24}
          iconType="MaterialIcons"
          onPress={onPress}
          testID="test"
        />
      );
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
});
