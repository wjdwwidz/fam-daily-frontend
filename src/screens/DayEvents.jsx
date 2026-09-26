import { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 하루치 일정 — 달력에서 날짜를 누르면 들어온다.
// 여기서 일정을 고르면 수정 화면이 뜨고, 아래 버튼으로 그날 일정을 더 추가한다.
export default function DayEvents() {
  const vm = useVm()
  // 화면을 떠나면 고른 날을 비운다 (달력으로 돌아가면 그 달 전체가 보이게)
  useEffect(() => () => vm.clearPickedDay(), [])

  const items = vm.calDayEvents
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>{vm.calPickedLabel}</Text>
      </View>

      {items.length === 0 && (
        <Text style={s('padding:5xl 0;text-align:center;font-size:12.5px;color:#9DB2BD')}>이날은 아직 일정이 없어요</Text>
      )}

      <View style={s('gap:md')}>
        {items.map((e) => (
          <Pressable key={e.id} onPress={e.edit} style={s('flex-direction:row;align-items:center;gap:lg;padding:md hair;cursor:pointer')}>
            <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: e.color }} />
            <View style={s('flex:1;min-width:0')}>
              <Text numberOfLines={1} style={s('font-size:13px;font-weight:700;color:#17303B')}>{e.title}</Text>
              <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>
                {e.when}{e.byName ? ` · ${e.byName}님` : ''}
              </Text>
            </View>
            <Pressable onPress={e.remove} hitSlop={10} accessibilityLabel="일정 지우기" style={s('width:30px;height:30px;border-radius:10px;align-items:center;justify-content:center;cursor:pointer')}>
              <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#B4C1CA" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" />
                <Path d="M10 11 v6 M14 11 v6" />
              </Svg>
            </Pressable>
          </Pressable>
        ))}
      </View>

      {/* 이날 일정 더 넣기 — 고른 날이 시작일로 채워진다 */}
      <Pressable onPress={vm.openEvent} style={s('flex-direction:row;align-items:center;justify-content:center;gap:sm;margin-top:3xl;height:50px;border-radius:16px;border:1.5px dashed #FFD3E2;cursor:pointer')}>
        <Text style={s('font-size:15px;font-weight:800;color:#FF5E8A;line-height:1')}>＋</Text>
        <Text style={s('font-size:12.5px;font-weight:700;color:#FF5E8A')}>일정 추가</Text>
      </Pressable>
    </View>
  )
}
