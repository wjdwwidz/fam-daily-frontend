import { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, Platform } from 'react-native'
import { s } from '../lib/style.js'

// 위아래로 굴려서 고르는 휠 (iOS 날짜 고르기처럼).
// 가운데 칸에 멈춘 값이 선택된다. 칸을 누르면 그 값이 바로 선택되고 가운데로 굴러온다.
//
// items: 숫자 목록, value: 지금 값, onChange(n), unit: 뒤에 붙일 글자('년' 등)
const ITEM_H = 36
const VISIBLE = 5 // 홀수여야 가운데가 딱 한 칸
const PAD = ITEM_H * ((VISIBLE - 1) / 2)
const isWeb = Platform.OS === 'web'

export default function WheelPicker({ items, value, onChange, unit = '', width = 72 }) {
  const ref = useRef(null)
  const idxOf = (v) => Math.max(0, items.indexOf(v))
  // 굴리는 동안 가운데에 온 칸 — 손을 떼기 전에도 강조가 따라오게
  const [center, setCenter] = useState(idxOf(value))
  const settleTimer = useRef(null)
  // 지금 스크롤이 가리키는 칸. 바깥에서 값이 바뀌었을 때(말일 당김 등)만 다시 굴린다.
  const scrolledIdx = useRef(idxOf(value))

  const scrollToIdx = (i, animated) => {
    scrolledIdx.current = i
    setCenter(i)
    ref.current?.scrollTo({ y: i * ITEM_H, animated })
  }

  useEffect(() => {
    const i = idxOf(value)
    if (i !== scrolledIdx.current) scrollToIdx(i, false)
  }, [value, items.length])

  // 처음 그릴 때 지금 값으로 맞춘다. 레이아웃만으로는 이르다 — 목록 크기가 정해질 때 한 번 더.
  const alignToValue = () => ref.current?.scrollTo({ y: idxOf(value) * ITEM_H, animated: false })

  // 닫힐 때 브라우저가 목록을 맨 위로 되돌리며 스크롤 이벤트를 한 번 더 보낸다(정리가 끝난 뒤에도).
  // 그걸 선택으로 치면 닫기만 해도 값이 맨 앞(1일·1월)으로 바뀌었다 — 닫힌 뒤로는 아무것도 받지 않는다.
  const alive = useRef(true)

  const commit = (i) => {
    if (!alive.current) return
    const n = items[i]
    if (n != null && n !== value) onChange(n)
  }

  const onScroll = (e) => {
    if (!alive.current) return
    const y = e.nativeEvent.contentOffset.y
    const i = Math.min(items.length - 1, Math.max(0, Math.round(y / ITEM_H)))
    scrolledIdx.current = i
    if (i !== center) setCenter(i)
    // 웹은 굴림이 끝났다는 이벤트가 없어서, 잠깐 멈추면 끝난 것으로 본다
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => commit(i), 140)
  }
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; clearTimeout(settleTimer.current) }
  }, [])

  return (
    <View style={{ width, height: ITEM_H * VISIBLE }}>
      {/* 가운데 선택 띠 */}
      <View pointerEvents="none" style={[s('position:absolute;left:0;right:0;border-radius:10px;background:#FCEEF4'), { top: PAD, height: ITEM_H }]} />
      <ScrollView
        ref={ref}
        onLayout={alignToValue}
        onContentSizeChange={alignToValue}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        // 네이티브는 칸 단위로 멈추게, 웹은 CSS scroll-snap 으로
        snapToInterval={isWeb ? undefined : ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => commit(Math.round(e.nativeEvent.contentOffset.y / ITEM_H))}
        style={isWeb ? { scrollSnapType: 'y mandatory' } : undefined}
        contentContainerStyle={{ paddingVertical: PAD }}
      >
        {items.map((n, i) => {
          const dist = Math.abs(i - center)
          return (
            <Pressable
              key={n}
              // 누른 칸을 바로 고른다 (스크롤이 멈추길 기다리지 않는다)
              onPress={() => { scrollToIdx(i, true); commit(i) }}
              style={[{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }, isWeb && { scrollSnapAlign: 'center' }]}
            >
              <Text style={s(`font-size:${dist === 0 ? 14 : 12.5}px;font-weight:${dist === 0 ? 800 : 600};font-variant:tabular-nums;color:${dist === 0 ? '#FF5E8A' : '#6A7E88'};opacity:${dist === 0 ? 1 : dist === 1 ? 0.6 : 0.3}`)}>
                {n}{unit}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
