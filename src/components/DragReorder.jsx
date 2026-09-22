import { useMemo, useRef, useState } from 'react'
import { Animated, PanResponder } from 'react-native'

// 가로로 늘어선 항목을 끌어서 순서를 바꾼다.
//
// RN 코어의 PanResponder 만 쓴다 — react-native-draggable-flatlist 같은 라이브러리는
// 네이티브 코드를 들고 와서 새 APK 를 빌드해야 한다. 이 앱은 스와이프 뒤로가기·
// 당겨서 새로고침도 같은 방식으로 만들어져 있다.
//
// 항목 폭이 모두 같다는 전제로, 끌린 거리를 한 칸 폭으로 나눠 몇 칸 옮길지 정한다.
export default function DragReorder({ items, itemWidth, gap, onReorder, renderItem }) {
  const step = itemWidth + gap
  // 지금 끌고 있는 항목과, 놓으면 갈 자리
  const [drag, setDrag] = useState(null) // { from, to }
  const tx = useRef(new Animated.Value(0)).current
  // PanResponder 는 한 번만 만들고, 최신 값은 여기서 읽는다
  const latest = useRef({ items, step, onReorder })
  latest.current = { items, step, onReorder }

  const responders = useMemo(
    () =>
      items.map((_, index) =>
        PanResponder.create({
          // 탭(사진 빼기 X 버튼 등)은 그대로 흘려보내고, 옆으로 끌 때만 잡는다
          onStartShouldSetPanResponder: () => false,
          onMoveShouldSetPanResponder: (e, g) =>
            Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
          onPanResponderGrant: () => {
            tx.setValue(0)
            setDrag({ from: index, to: index })
          },
          onPanResponderMove: (e, g) => {
            tx.setValue(g.dx)
            const { items: list, step: s } = latest.current
            const to = Math.max(0, Math.min(list.length - 1, index + Math.round(g.dx / s)))
            setDrag((d) => (d && d.to === to ? d : { from: index, to }))
          },
          onPanResponderRelease: (e, g) => {
            const { items: list, step: s, onReorder: cb } = latest.current
            const to = Math.max(0, Math.min(list.length - 1, index + Math.round(g.dx / s)))
            tx.setValue(0)
            setDrag(null)
            if (to !== index) cb(index, to)
          },
          onPanResponderTerminate: () => {
            tx.setValue(0)
            setDrag(null)
          },
        }),
      ),
    // 항목 수가 바뀌면 다시 만든다 (index 가 responder 에 묶여 있다)
    [items.length],
  )

  // 끌고 있는 항목이 비운 자리만큼 사이 항목들을 한 칸씩 밀어 보여준다
  const shiftOf = (i) => {
    if (!drag || i === drag.from) return 0
    const { from, to } = drag
    if (from < to && i > from && i <= to) return -step
    if (from > to && i >= to && i < from) return step
    return 0
  }

  return (
    <>
      {items.map((it, i) => {
        const dragging = drag?.from === i
        return (
          <Animated.View
            key={it.key ?? i}
            {...responders[i].panHandlers}
            style={{
              width: itemWidth,
              transform: [{ translateX: dragging ? tx : shiftOf(i) }],
              // 끌고 있는 것은 위로 올리고 살짝 키워 집은 느낌을 준다
              zIndex: dragging ? 10 : 1,
              opacity: dragging ? 0.92 : 1,
            }}
          >
            {renderItem(it, i, dragging)}
          </Animated.View>
        )
      })}
    </>
  )
}
