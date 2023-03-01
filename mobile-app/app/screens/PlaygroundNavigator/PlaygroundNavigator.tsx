import { createStackNavigator } from "@react-navigation/stack";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { PlaygroundProvider } from "@waveshq/walletkit-ui";
import { PlaygroundScreen } from "./PlaygroundScreen";

export interface PlaygroundParamList {
  PlaygroundScreen: undefined;

  [key: string]: undefined | object;
}

const PlaygroundStack = createStackNavigator<PlaygroundParamList>();

export function PlaygroundNavigator(): JSX.Element {
  const screenOptions = useNavigatorScreenOptions();
  return (
    <PlaygroundProvider>
      <PlaygroundStack.Navigator>
        <PlaygroundStack.Screen
          component={PlaygroundScreen}
          name="PlaygroundScreen"
          options={{
            ...screenOptions,
            headerTitle: "Playground",
          }}
        />
      </PlaygroundStack.Navigator>
    </PlaygroundProvider>
  );
}
