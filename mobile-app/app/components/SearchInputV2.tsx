import { StyleProp, TextInputProps, ViewStyle } from "react-native";
import {
  ThemedIcon,
  ThemedProps,
  ThemedTextInputV2,
  ThemedViewV2,
} from "@components/themed";
import { ClearButtonV2 } from "@components/WalletTextInputV2";
import { tailwind } from "@tailwind";
import { forwardRef } from "react";

type SearchInputProps = React.PropsWithChildren<TextInputProps> &
  ISearchInputProps;

interface ISearchInputProps extends ThemedProps {
  showClearButton: boolean;
  inputStyle?: ThemedProps;
  containerStyle?: StyleProp<ViewStyle>;
  onClearInput: () => void;
}

export const SearchInputV2 = forwardRef<any, SearchInputProps>(
  (props: SearchInputProps, ref: React.Ref<any>): JSX.Element => {
    const {
      onClearInput,
      containerStyle,
      inputStyle,
      light = tailwind("bg-mono-light-v2-00"),
      dark = tailwind("bg-mono-dark-v2-00"),
      testID,
      ...otherProps
    } = props;
    return (
      <ThemedViewV2
        light={light}
        dark={dark}
        style={[
          tailwind("rounded-2xl-v2 flex flex-row items-center px-5 py-3"),
          props.containerStyle,
        ]}
      >
        <ThemedIcon
          iconType="Feather"
          name="search"
          size={16}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-light-v2-500")}
          style={tailwind("mr-2 my-px")}
        />
        <ThemedTextInputV2
          ref={ref}
          testID={testID}
          {...inputStyle}
          {...otherProps}
          style={[
            tailwind("flex-grow w-8/12 font-normal-v2 flex-1 text-xs"),
            tailwind({ "mr-4": !props.showClearButton }),
          ]}
        />
        {props.showClearButton && (
          <ClearButtonV2
            onPress={onClearInput}
            testID={`${testID}_clear_btn`}
          />
        )}
      </ThemedViewV2>
    );
  }
);
