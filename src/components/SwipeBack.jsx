import { useMemo, useRef } from 'react'
import { Animated, PanResponder } from 'react-native'

// 왼쪽 가장자리에서 오른쪽으로 밀면 뒤로가기.
//
// 가장자리에서 시작한 가로 스와이프만 인식한다. 화면 안쪽에는 가로 스크롤
// (일상 탭, 사전 사진 넘기기, 올리기 썸네일)이 있어서, 아무 데서나 인식하면 그것들과 싸운다.
const EDGE = 28 // 이 안에서 시작해야 뒤로가기로 본다
const TRIGGER = 90 // 이만큼 밀면 뒤로
const MAX = 140 // 따라오는 최대 거리

export default function SwipeBack({ enabled, onBack, children }) {
  const tx = useRef(new Animated.Value(0)).current
  // PanResponder 는 한 번만 만든다. 최신 enabled·onBack 은 여기서 읽는다.
  const latest = useRef({ enabled, onBack })
  latest.current = { enabled, onBack }

  const reset = (duration = 160) =>
    Animated.timing(tx, { toValue: 0, duration, useNativeDriver: false }).start()

  const responder = useMemo(
    () =>
      PanResponder.create({
        // 탭은 그대로 아래로 흘려보낸다
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (e, g) => {
          if (!latest.current.enabled) return false
          const startX = g.moveX - g.dx // 손가락이 처음 닿은 x
          return startX <= EDGE && g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 2
        },
        onPanResponderMove: (e, g) => tx.setValue(Math.max(0, Math.min(MAX, g.dx))),
        onPanResponderRelease: (e, g) => {
          if (g.dx > TRIGGER) {
            // 화면을 제자리로 되돌린 뒤 이전 화면으로 (화면이 바뀌며 진입 모션이 다시 돈다)
            tx.setValue(0)
            latest.current.onBack?.()
            return
          }
          reset()
        },
        onPanResponderTerminate: () => reset(),
      }),
    [],
  )

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: tx }] }} {...responder.panHandlers}>
      {children}
    </Animated.View>
  )
}
