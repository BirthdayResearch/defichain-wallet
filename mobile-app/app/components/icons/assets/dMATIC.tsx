import Svg, { Path, SvgProps } from "react-native-svg";

export function dMATIC(props: SvgProps): JSX.Element {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 18C0 8.05891 8.05891 0 18 0C27.9411 0 36 8.05891 36 18C36 27.9411 27.9411 36 18 36C8.05891 36 0 27.9411 0 18Z"
        fill="#FEFEFE"
      />
      <Path
        d="M23.6146 13.8437C23.2135 13.6146 22.6979 13.6146 22.2396 13.8437L19.0312 15.7344L16.8542 16.9375L13.7031 18.8281C13.3021 19.0573 12.7865 19.0573 12.3281 18.8281L9.86458 17.3385C9.46354 17.1094 9.17708 16.651 9.17708 16.1354V13.2708C9.17708 12.8125 9.40625 12.3541 9.86458 12.0677L12.3281 10.6354C12.7292 10.4062 13.2448 10.4062 13.7031 10.6354L16.1667 12.125C16.5677 12.3541 16.8542 12.8125 16.8542 13.3281V15.2187L19.0312 13.9583V12.0104C19.0312 11.5521 18.8021 11.0937 18.3437 10.8073L13.7604 8.11456C13.3594 7.8854 12.8437 7.8854 12.3854 8.11456L7.6875 10.8646C7.22917 11.0937 7 11.5521 7 12.0104V17.3958C7 17.8541 7.22917 18.3125 7.6875 18.5989L12.3281 21.2916C12.7292 21.5208 13.2448 21.5208 13.7031 21.2916L16.8542 19.4583L19.0312 18.1979L22.1823 16.3646C22.5833 16.1354 23.099 16.1354 23.5573 16.3646L26.0208 17.7969C26.4219 18.026 26.7083 18.4844 26.7083 19V21.8646C26.7083 22.3229 26.4792 22.7812 26.0208 23.0677L23.6146 24.5C23.2135 24.7291 22.6979 24.7291 22.2396 24.5L19.776 23.0677C19.375 22.8385 19.0885 22.3802 19.0885 21.8646V20.0312L16.9115 21.2916V23.1823C16.9115 23.6406 17.1406 24.0989 17.599 24.3854L22.2396 27.0781C22.6406 27.3073 23.1562 27.3073 23.6146 27.0781L28.2552 24.3854C28.6562 24.1562 28.9427 23.6979 28.9427 23.1823V17.7396C28.9427 17.2812 28.7135 16.8229 28.2552 16.5364L23.6146 13.8437Z"
        fill="#8247E5"
      />
    </Svg>
  );
}
