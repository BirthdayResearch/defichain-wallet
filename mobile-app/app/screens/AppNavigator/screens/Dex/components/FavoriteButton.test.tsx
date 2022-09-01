import { render } from "@testing-library/react-native";
import { FavoriteButton } from "./FavoriteButton";

jest.mock("@shared-contexts/ThemeProvider");

describe("Favorite Button", () => {
  it("should match snapshot", () => {
    const rendered = render(
      <FavoriteButton isFavouritePair pairId="1" onPress={jest.fn()} />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
