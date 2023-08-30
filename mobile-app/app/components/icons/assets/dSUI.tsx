import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";

export function dSUI(props: SvgProps): JSX.Element {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none" {...props}>
      <G clip-path="url(#clip0_4798_2431)">
        <G clip-path="url(#clip1_4798_2431)">
          <Path
            d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
            fill="#F1F3F4"
          />
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M32.4037 20.9259L32.4031 20.9274C33.8631 22.7581 34.7356 25.0769 34.7356 27.5989C34.7356 30.1584 33.837 32.5086 32.3375 34.3517L32.2084 34.5104L32.1742 34.3087C32.1451 34.1372 32.1109 33.964 32.0711 33.7895C31.3207 30.4924 28.8758 27.6651 24.8518 25.376C22.1345 23.8344 20.579 21.9781 20.1707 19.869C19.9069 18.5051 20.103 17.1353 20.4819 15.9619C20.8608 14.789 21.4243 13.8062 21.903 13.2146L21.9033 13.2142L23.4687 11.3001C23.7432 10.9645 24.2569 10.9645 24.5315 11.3001L32.4037 20.9259ZM34.8796 19.0135L34.8799 19.0128L24.3879 6.18371C24.1875 5.93876 23.8125 5.93876 23.6121 6.18371L13.12 19.0129L13.1203 19.0137L13.0862 19.056C11.1554 21.4519 10 24.4966 10 27.811C10 35.5302 16.2679 41.7881 24 41.7881C31.7321 41.7881 38 35.5302 38 27.811C38 24.4966 36.8446 21.4519 34.9138 19.056L34.8796 19.0135ZM15.6305 20.8845L15.6309 20.884L16.5693 19.7365L16.5977 19.9483C16.6202 20.1161 16.6474 20.2848 16.6797 20.4542C17.287 23.6402 19.4561 26.2967 23.0827 28.3541C26.2351 30.1483 28.0705 32.2114 28.5994 34.4741C28.82 35.4184 28.8593 36.3475 28.7638 37.1598L28.7578 37.21L28.7124 37.2323C27.2896 37.9273 25.6901 38.3175 23.9997 38.3175C18.0705 38.3175 13.2638 33.5187 13.2638 27.5989C13.2638 25.0572 14.1498 22.7218 15.6305 20.8845Z"
            fill="#4CA2FF"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_4798_2431">
          <rect width="48" height="48" fill="white" />
        </ClipPath>
        <ClipPath id="clip1_4798_2431">
          <rect width="48" height="48" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
