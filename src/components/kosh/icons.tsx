import Svg, { Circle, Path } from 'react-native-svg';

export type IconName = 'eye' | 'eye-off' | 'close' | 'search' | 'trash' | 'plus' | 'bell';

/** Lucide-style outline icons: 24px box, 1.75 stroke, rounded joins. */
export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round">
      {name === 'eye' && (
        <>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      )}
      {name === 'eye-off' && (
        <>
          <Path d="M3 3l18 18" />
          <Path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-1" />
          <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" />}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={7} />
          <Path d="M20 20l-4-4" />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4 7h16M10 11v6M14 11v6" />
          <Path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" />}
      {name === 'bell' && <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4" />}
    </Svg>
  );
}
