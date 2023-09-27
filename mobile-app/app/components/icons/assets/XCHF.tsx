import Svg, { Path, SvgProps } from "react-native-svg";

export function XCHF(props: SvgProps): JSX.Element {
  return (
    <Svg width="36" height="36" viewBox="0 0 36 36" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 18C0 8.05891 8.05891 0 18 0C27.9411 0 36 8.05891 36 18C36 27.9411 27.9411 36 18 36C8.05891 36 0 27.9411 0 18Z"
        fill="#CE0E2D"
      />
      <Path
        d="M13.023 24.1571H5.65027L13.1825 12.0313L15.1859 15.0667L13.911 17.1915L13.1825 16.1898L9.60073 22.0229H11.7862L20.8809 7.57166C24.98 14.0487 27.2782 17.6801 31.3773 24.1571L18.1969 24.1571L15.998 20.6809L17.3077 18.6113L19.5066 22.0229H27.5584L20.8809 11.4002L13.023 24.1571Z"
        fill="white"
      />
    </Svg>
  );
}
