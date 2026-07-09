import { LinearGradient } from 'expo-linear-gradient'
import { s } from '../lib/style.js'

// 브랜드 그라디언트: linear-gradient(135deg,#FF9F6B 0%,#FF5E8A 55%,#A66CFF 100%)
// 135deg(좌상 → 우하) ≈ start {0,0} end {1,1}
export function Grad({
  colors = ['#FF9F6B', '#FF5E8A', '#A66CFF'],
  locations = [0, 0.55, 1],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}) {
  return (
    <LinearGradient colors={colors} locations={locations} start={start} end={end} style={typeof style === 'string' ? s(style) : style}>
      {children}
    </LinearGradient>
  )
}
