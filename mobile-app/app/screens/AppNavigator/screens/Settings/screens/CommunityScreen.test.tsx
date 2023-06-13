import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import { CommunityScreen } from "./CommunityScreen";

it.skip("<CommunityScreen /> should match snapshot", async () => {
  const tree = render(<CommunityScreen />);
  expect(tree.toJSON()).toMatchSnapshot();
  const receiveButton = await tree.findByTestId("gh");
  fireEvent.press(receiveButton);
  expect(Linking.canOpenURL).toHaveBeenCalled();
});
