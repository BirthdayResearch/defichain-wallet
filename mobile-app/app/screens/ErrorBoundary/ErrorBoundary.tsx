import { Component, ReactElement } from "react";
import { Image } from "react-native";
import ImageGenericError from "@assets/images/misc/generic_error.png";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { Logging } from "@api";
import { Text, View } from "../../components";

interface Props {
  children: ReactElement;
}

interface State {
  hasError: boolean;
}

export function ErrorDisplayComponent(): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <View
      style={tailwind("bg-mono-dark-v2-100 flex-1 items-center pt-44 px-14")}
    >
      <View style={tailwind("items-center justify-center px-15 pb-8")}>
        <Image source={ImageGenericError} style={{ width: 204, height: 96 }} />
      </View>

      <Text style={tailwind("text-xl font-semibold-v2 text-mono-dark-v2-900")}>
        {translate("screens/ErrorBoundary", "We ran into an issue")}
      </Text>

      <Text
        style={tailwind(
          "font-normal-v2 text-mono-dark-v2-900 mt-2 text-center"
        )}
      >
        {translate(
          "screens/ErrorBoundary",
          "There seems to be an issue. Try restarting the application."
        )}
      </Text>
    </View>
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any): any {
    // You can also log the error to an error reporting service
    Logging.error(error);
    Logging.error(errorInfo);
  }

  render(): JSX.Element {
    return this.state.hasError ? (
      <ErrorDisplayComponent />
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
