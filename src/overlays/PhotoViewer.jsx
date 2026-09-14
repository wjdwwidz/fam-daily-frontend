import { useEffect, useMemo, useRef } from 'react'
import { Animated, Image, PanResponder, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const DOUBLE_TAP_MS = 250
const TAP_SLOP = 8 // 이만큼 안 움직였으면 탭으로 본다

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const distance = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY)

// 사진 원본 보기. vm.openPhotoViewer(url) 로 연다.
// 화면에서는 틀에 맞춰 잘라 보여주더라도, 여기서는 contain 으로 사진 전체를 원본 비율대로 보여준다.
//
// 제스처 (라이브러리 없이 PanResponder 로 — 웹·네이티브 모두 같은 코드로 동작)
//  - 두 손가락 벌리기/오므리기: 확대·축소
//  - 확대 상태에서 한 손가락 끌기: 이동
//  - 두 번 탭: 확대 ↔ 원래 크기
//  - 한 번 탭: 확대 안 된 상태에서만 닫힘 (확대 중 실수로 닫히지 않게)
export default function PhotoViewer() {
  const vm = useVm()
  const insets = useSafeAreaInsets()

  const scale = useRef(new Animated.Value(1)).current
  const tx = useRef(new Animated.Value(0)).current
  const ty = useRef(new Animated.Value(0)).current

  // 제스처 계산용 현재값 (Animated.Value 는 동기로 읽기 불편해서 따로 들고 있는다)
  const g = useRef({
    scale: 1, x: 0, y: 0,
    size: { w: 0, h: 0 },
    // 이번 제스처의 시작 기준
    touches: 0, startDist: 0, startScale: 1, startX: 0, startY: 0, originX: 0, originY: 0,
    moved: false, lastTap: 0, tapTimer: null,
  }).current

  const set = (next) => {
    const maxX = (g.size.w * (next.scale - 1)) / 2
    const maxY = (g.size.h * (next.scale - 1)) / 2
    g.scale = next.scale
    g.x = clamp(next.x, -maxX, maxX)
    g.y = clamp(next.y, -maxY, maxY)
    scale.setValue(g.scale)
    tx.setValue(g.x)
    ty.setValue(g.y)
  }

  const animateTo = (next) => {
    g.scale = next.scale
    g.x = next.x
    g.y = next.y
    Animated.parallel([
      Animated.spring(scale, { toValue: next.scale, useNativeDriver: false, friction: 7 }),
      Animated.spring(tx, { toValue: next.x, useNativeDriver: false, friction: 7 }),
      Animated.spring(ty, { toValue: next.y, useNativeDriver: false, friction: 7 }),
    ]).start()
  }

  // 손가락 수가 바뀔 때마다(1→2, 2→1) 기준을 다시 잡아야 화면이 튀지 않는다
  const begin = (touches) => {
    g.touches = touches.length
    g.startScale = g.scale
    g.startX = g.x
    g.startY = g.y
    if (touches.length >= 2) {
      g.startDist = distance(touches[0], touches[1]) || 1
      g.originX = (touches[0].pageX + touches[1].pageX) / 2
      g.originY = (touches[0].pageY + touches[1].pageY) / 2
    } else if (touches.length === 1) {
      g.originX = touches[0].pageX
      g.originY = touches[0].pageY
    }
  }

  const onTap = () => {
    const now = Date.now()
    if (now - g.lastTap < DOUBLE_TAP_MS) {
      clearTimeout(g.tapTimer)
      g.lastTap = 0
      animateTo(g.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 })
      return
    }
    g.lastTap = now
    // 두 번째 탭을 기다렸다가, 안 오면 한 번 탭으로 처리
    g.tapTimer = setTimeout(() => {
      if (g.scale <= 1) vm.closePhotoViewer()
    }, DOUBLE_TAP_MS)
  }

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          g.moved = false
          begin(e.nativeEvent.touches)
        },
        onPanResponderMove: (e) => {
          const touches = e.nativeEvent.touches
          if (touches.length !== g.touches) begin(touches)

          if (touches.length >= 2) {
            g.moved = true
            const ratio = distance(touches[0], touches[1]) / g.startDist
            const midX = (touches[0].pageX + touches[1].pageX) / 2
            const midY = (touches[0].pageY + touches[1].pageY) / 2
            set({
              scale: clamp(g.startScale * ratio, MIN_SCALE, MAX_SCALE),
              x: g.startX + (midX - g.originX),
              y: g.startY + (midY - g.originY),
            })
          } else if (touches.length === 1) {
            const dx = touches[0].pageX - g.originX
            const dy = touches[0].pageY - g.originY
            if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) g.moved = true
            if (g.scale > 1) set({ scale: g.scale, x: g.startX + dx, y: g.startY + dy })
          }
        },
        onPanResponderRelease: () => {
          g.touches = 0
          if (!g.moved) {
            onTap()
            return
          }
          // 원래 크기보다 작게 오므렸으면 제자리로
          if (g.scale <= 1) animateTo({ scale: 1, x: 0, y: 0 })
        },
        onPanResponderTerminate: () => {
          g.touches = 0
        },
      }),
    [],
  )

  // 닫힐 때 '한 번 탭' 대기 타이머가 남지 않게
  useEffect(() => () => clearTimeout(g.tapTimer), [])

  return (
    <View style={s('position:absolute;inset:0;background:rgba(0,0,0,0.92);z-index:70;overflow:hidden')}>
      <View
        {...responder.panHandlers}
        // 웹: 브라우저가 터치를 스크롤·확대로 가로채지 않게
        style={{ flex: 1, touchAction: 'none' }}
        onLayout={(e) => {
          g.size = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }
        }}
      >
        <Animated.View style={{ flex: 1, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}>
          <Image source={{ uri: vm.photoViewerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </Animated.View>
      </View>
      <Pressable onPress={vm.closePhotoViewer} style={[s('position:absolute;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;cursor:pointer'), { top: insets.top + 12 }]}>
        <Text style={s('color:#fff;font-size:20px')}>×</Text>
      </Pressable>
    </View>
  )
}
