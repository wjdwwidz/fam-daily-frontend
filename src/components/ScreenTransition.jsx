import { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native'

// 화면 전환 모션. 새 화면이 서서히 나타난다(페이드인).
//
// 나가는 화면은 애니메이션하지 않는다(크로스페이드 아님). 화면들이 useVm() 으로 전역
// 상태를 직접 읽기 때문에, 이전 화면을 남겨두면 새 데이터로 다시 그려지며 깨진다.

// RN Web 은 네이티브 드라이버가 없다(경고만 남고 JS 로 동작).
const NATIVE = Platform.OS !== 'web'

const DURATION = 240

// 손쉬운 사용 설정의 '동작 줄이기'. 한 번 읽어 캐시하고 변경을 구독한다.
let reduceMotion = false
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((on) => {
    reduceMotion = !!on
  })
  .catch(() => {})
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (on) => {
  reduceMotion = !!on
})

function Enter({ children }) {
  const anim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current

  useEffect(() => {
    if (reduceMotion) return
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE,
    })
    a.start()
    return () => a.stop()
  }, [anim])

  return <Animated.View style={{ flexGrow: 1, opacity: anim }}>{children}</Animated.View>
}

// screenKey 가 바뀔 때마다 Enter 를 새로 마운트해 진입 모션을 태운다.
export default function ScreenTransition({ screenKey, children }) {
  return <Enter key={screenKey}>{children}</Enter>
}
