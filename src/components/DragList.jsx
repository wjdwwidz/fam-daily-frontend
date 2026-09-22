import { useMemo, useRef, useState } from 'react'
import { Animated, PanResponder, Platform } from 'react-native'

// 세로로 늘어선 줄을 손잡이로 끌어서 순서를 바꾼다. (가로 버전은 DragReorder)
//
// 줄 전체를 잡으면 목록 스크롤과 싸우게 되므로, renderItem 이 건네받은 handle 을
// 손잡이(≡)에만 펴 준다. 손잡이를 잡는 순간부터 끌기다 — 길게 누를 필요 없다.
// 줄 높이는 모두 같다는 전제로, 첫 줄의 높이를 재서 한 칸으로 쓴다.
//
// renderItem(item, index, { dragging, handle }) — handle 을 손잡이 View 에 펼친다
// canDrag(item) — false 면 그 줄은 손잡이를 주지 않는다 (빈 칸 등)
const isWeb = Platform.OS === 'web'

export default function DragList({ items, onReorder, renderItem, canDrag = () => true }) {
  const [drag, setDrag] = useState(null) // { from, to }
  const ty = useRef(new Animated.Value(0)).current
  const rowH = useRef(0)
  const latest = useRef({ items, onReorder })
  latest.current = { items, onReorder }

  const clampTo = (index, dy) => {
    const h = rowH.current || 1
    return Math.max(0, Math.min(latest.current.items.length - 1, index + Math.round(dy / h)))
  }

  const responders = useMemo(
    () =>
      items.map((_, index) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          // 끄는 도중 목록 스크롤이 손을 가로채지 못하게
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
            ty.setValue(0)
            setDrag({ from: index, to: index })
          },
          onPanResponderMove: (e, g) => {
            ty.setValue(g.dy)
            const to = clampTo(index, g.dy)
            setDrag((d) => (d && d.to === to ? d : { from: index, to }))
          },
          onPanResponderRelease: (e, g) => {
            const to = clampTo(index, g.dy)
            ty.setValue(0)
            setDrag(null)
            if (to !== index) latest.current.onReorder(index, to)
          },
          onPanResponderTerminate: () => {
            ty.setValue(0)
            setDrag(null)
          },
        }),
      ),
    [items.length],
  )

  // 끌고 있는 줄이 지나간 자리의 줄들을 한 칸씩 밀어 보여준다
  const shiftOf = (i) => {
    if (!drag || i === drag.from) return 0
    const { from, to } = drag
    const h = rowH.current
    if (from < to && i > from && i <= to) return -h
    if (from > to && i >= to && i < from) return h
    return 0
  }

  return items.map((it, i) => {
    const dragging = drag?.from === i
    const handle = canDrag(it)
      ? {
          ...responders[i].panHandlers,
          // 웹: 손잡이 위에서는 브라우저가 스크롤하지 않게
          style: isWeb ? { touchAction: 'none', cursor: 'grab' } : undefined,
        }
      : null
    return (
      <Animated.View
        key={it.key ?? i}
        onLayout={i === 0 ? (e) => { rowH.current = e.nativeEvent.layout.height } : undefined}
        style={{
          transform: [{ translateY: dragging ? ty : shiftOf(i) }],
          zIndex: dragging ? 10 : 1,
          opacity: dragging ? 0.92 : 1,
        }}
      >
        {renderItem(it, i, { dragging, handle })}
      </Animated.View>
    )
  })
}
