import Svg, { Path, SvgProps, G, Defs, ClipPath, Rect } from 'react-native-svg'

export function dAMZN (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <G clipPath='url(#clip0_1462_4409)'>
        <Path
          fillRule='evenodd' clipRule='evenodd'
          d='M16.5 0C7.663 0 0.5 7.163 0.5 16C0.5 24.837 7.663 32 16.5 32C25.338 32 32.5 24.837 32.5 16C32.5 7.163 25.338 0 16.5 0Z'
          fill='#0E0A0D'
        />
        <Path
          d='M7.42553 16.986L6.65242 13.3894H6.63001L5.8569 16.986H7.42553ZM7.63841 12L9.75606 20H8.07539L7.70564 18.3081H5.57679L5.20704 20H3.52637L5.64401 12H7.63841Z'
          fill='white'
        />
        <Path
          d='M10.3954 12V20H11.8744V13.6134H11.8968L13.3198 20H14.5747L15.9977 13.6134H16.0201V20H17.4991V12H15.1125L13.9585 17.6471H13.936L12.7932 12H10.3954Z'
          fill='white'
        />
        <Path
          d='M18.4137 18.8235V20H23.2653V18.6779H20.2289L23.2205 13.2213V12H18.6154V13.3221H21.3605L18.4137 18.8235Z'
          fill='white'
        />
        <Path
          d='M26.0086 12H24.1487V20H25.6277V14.3978H25.6501L27.6221 20H29.4596V12H27.9806V17.479H27.9582L26.0086 12Z'
          fill='white'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_1462_4409'>
          <Rect width='32' height='32' fill='white' transform='translate(0.5)' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
