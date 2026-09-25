import { useRef, useState } from 'react'
import { View, Text, Pressable, Modal, useWindowDimensions } from 'react-native'
import { s } from '../lib/style.js'
import WheelPicker from './WheelPicker.jsx'

// 값만 보이는 칩. 누르면 그 바로 아래에 휠이 떠서(화면 위에 겹쳐서) 굴려 고른다.
// 바깥을 누르거나 칩을 다시 누르면 닫힌다.
// 화면 흐름 안에 펼치면 아래 내용이 밀려나므로 Modal 로 띄우고, 칩 위치를 재서 그 밑에 붙인다.
const GAP = 6
const EDGE = 12
const POP_H = 36 * 5 + 20 // 휠 5칸 + 위아래 여백·테두리

// closeOnPick: 고르자마자 닫는다 (달력 제목처럼 '고르면 끝' 인 곳).
// 날짜를 잇달아 맞추는 곳(일상·일정 날짜)에서는 열어둔 채로 둔다.
export default function WheelChip({ items, value, unit = '', width = 76, onChange, closeOnPick = false }) {
  const chipRef = useRef(null)
  const [pos, setPos] = useState(null) // 열려 있으면 { x, y, w, h } (칩의 화면 좌표)
  const { width: winW, height: winH } = useWindowDimensions()

  const open = () => {
    chipRef.current?.measureInWindow((x, y, w, h) => setPos({ x, y, w, h }))
  }
  const close = () => setPos(null)

  // 아래 자리가 모자라면(칩이 화면 아래쪽이면) 칩 위로 띄운다
  const below = pos ? pos.y + pos.h + GAP : 0
  const top = pos && below + POP_H > winH - EDGE ? pos.y - GAP - POP_H : below
  // 칩 가운데에 맞추되 화면 밖으로 나가지 않게
  const left = pos ? Math.min(Math.max(EDGE, pos.x + pos.w / 2 - width / 2 - 6), winW - width - 12 - EDGE) : 0

  return (
    <>
      <Pressable ref={chipRef} onPress={pos ? close : open} style={s(`flex-direction:row;align-items:center;gap:xs;height:32px;padding:0 lg;border-radius:10px;cursor:pointer;background:${pos ? '#FF5E8A' : '#FCEEF4'}`)}>
        <Text style={s(`font-size:12.5px;font-weight:700;font-variant:tabular-nums;color:${pos ? '#fff' : '#FF5E8A'}`)}>{value}{unit}</Text>
        <Text style={s(`font-size:9px;color:${pos ? '#fff' : '#FF5E8A'}`)}>{pos ? '▴' : '▾'}</Text>
      </Pressable>
      <Modal visible={!!pos} transparent animationType="fade" onRequestClose={close}>
        {/* 바깥을 누르면 닫힘 */}
        <Pressable onPress={close} style={{ flex: 1 }}>
          {pos && (
            // 안쪽을 눌러도 닫히지 않게 한 번 더 감싼다
            <Pressable onPress={() => {}} style={[s('position:absolute;background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:sm 6px;box-shadow:0 10px 24px rgba(255,94,138,0.18)'), { top, left }]}>
              <View>
                <WheelPicker items={items} value={value} unit={unit} width={width} onChange={(n) => { onChange(n); if (closeOnPick) close() }} />
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </>
  )
}
