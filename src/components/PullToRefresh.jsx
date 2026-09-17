import { useEffect, useMemo, useRef } from 'react'
import { ActivityIndicator, Animated, PanResponder, Platform, View } from 'react-native'

// 웹 전용 '아래로 당겨서 새로고침'.
//
// react-native-web 의 RefreshControl 은 빈 껍데기라(화면만 그리고 당기는 동작을 처리하지 않음)
// 아이폰 홈 화면 앱에서는 기본 기능으로 새로고침이 안 된다. 그래서 웹에서는 여기서 직접 인식한다.
// 네이티브(안드로이드·iOS 앱)는 ScrollView 의 RefreshControl 이 처리하므로 그대로 통과시킨다.
const TRIGGER = 64 // 이만큼 당기면 새로고침
const MAX = 96 // 따라오는 최대 거리

export default function PullToRefresh({ enabled, refreshing, onRefresh, atTopRef, children }) {
  const pull = useRef(new Animated.Value(0)).current
  const latest = useRef({ enabled, refreshing, onRefresh, atTopRef })
  latest.current = { enabled, refreshing, onRefresh, atTopRef }

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (e, g) => {
          const { enabled: on, refreshing: busy, atTopRef: top } = latest.current
          if (Platform.OS !== 'web' || !on || busy) return false
          // 맨 위에 있을 때, 아래로 끄는 동작만
          return !!top?.current && g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx) * 2
        },
        onPanResponderMove: (e, g) => {
          // 당길수록 덜 따라오게 (고무줄 느낌)
          pull.setValue(Math.min(MAX, Math.max(0, g.dy * 0.5)))
        },
        onPanResponderRelease: (e, g) => {
          if (g.dy * 0.5 >= TRIGGER) {
            Animated.timing(pull, { toValue: TRIGGER, duration: 120, useNativeDriver: false }).start()
            latest.current.onRefresh?.()
            return
          }
          Animated.timing(pull, { toValue: 0, duration: 160, useNativeDriver: false }).start()
        },
        onPanResponderTerminate: () =>
          Animated.timing(pull, { toValue: 0, duration: 160, useNativeDriver: false }).start(),
      }),
    [],
  )

  // 새로고침이 끝나면 접는다
  useEffect(() => {
    if (Platform.OS !== 'web' || refreshing) return
    Animated.timing(pull, { toValue: 0, duration: 200, useNativeDriver: false }).start()
  }, [refreshing])

  if (Platform.OS !== 'web') return children

  return (
    <View style={{ flex: 1 }} {...responder.panHandlers}>
      <Animated.View style={{ height: pull, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <View style={{ paddingBottom: 10 }}>
          <ActivityIndicator size="small" color="#FF5E8A" />
        </View>
      </Animated.View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}
