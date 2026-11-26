import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/** The Kosh mark (from the design system's `kosh-icon.svg`): cream K on a teal tile with a marigold coin. */
export function KoshLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" accessibilityLabel="Kosh">
      <Rect width={512} height={512} rx={112} fill="#0E5A52" />
      <G transform="translate(-11 5)">
        <G fill="none" stroke="#F6F3EC" strokeWidth={60} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M176 128V384" />
          <Path d="M180 262L336 136" />
          <Path d="M180 262L336 384" />
        </G>
        <Circle cx={346} cy={128} r={46} fill="#F2B01E" />
        <Circle cx={346} cy={128} r={26} fill="none" stroke="#0E5A52" strokeWidth={8} />
      </G>
    </Svg>
  );
}
