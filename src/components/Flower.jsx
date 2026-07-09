import Svg, { Ellipse, Circle } from 'react-native-svg'

// 6-petal flower (petals at 0/60/…/300°)
export function Flower6({ size = 100, petal, center, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <Ellipse key={a} cx="50" cy="24" rx="11" ry="18" fill={petal} transform={`rotate(${a} 50 50)`} />
      ))}
      <Circle cx="50" cy="50" r="13" fill={center} />
    </Svg>
  )
}

// 5-petal flower (petals at 0/72/…/288°)
export function Flower5({ size = 100, petal, center, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      {[0, 72, 144, 216, 288].map((a) => (
        <Ellipse key={a} cx="50" cy="26" rx="12" ry="18" fill={petal} transform={`rotate(${a} 50 50)`} />
      ))}
      <Circle cx="50" cy="50" r="12" fill={center} />
    </Svg>
  )
}

export function Leaf({ size = 56, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <Ellipse cx="40" cy="46" rx="13" ry="26" fill="#8FD6A0" transform="rotate(-35 40 46)" />
      <Ellipse cx="62" cy="56" rx="11" ry="22" fill="#A6E0B4" transform="rotate(30 62 56)" />
    </Svg>
  )
}
