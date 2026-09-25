import { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// D-day 전체보기 — 홈은 앞의 몇 개만 보여주고, 여기서 다 본다.
export default function DdayAll() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadDdayAll() }, [groupId])
  // 홈에서 누르고 들어온 일정만 잠깐 표시해 둔다. 나갈 때 지워서,
  // 다음에 그냥 들어오면 표시 없이 목록만 보이게.
  useEffect(() => () => vm.clearDdayFocus(), [])

  const items = vm.ddayEvents
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>다가오는 일정</Text>
      </View>
      {items.length === 0 && (
        <Text style={s('padding:6xl 0;text-align:center;font-size:12.5px;color:#9DB2BD')}>아직 D-day 로 켜둔 일정이 없어요</Text>
      )}

      <View style={s('gap:sm;margin-top:2xl')}>
        {items.map((d) => (
          <Pressable key={d.key} onPress={d.open} style={s(`flex-direction:row;align-items:center;gap:lg;padding:md lg;border-radius:16px;cursor:pointer;background:${d.key === vm.ddayFocus ? '#FFF0F5' : 'transparent'};border:1px solid ${d.key === vm.ddayFocus ? '#FFD3E2' : 'transparent'}`)}>
            <View style={{ width: 4, height: 30, borderRadius: 2, backgroundColor: d.color }} />
            <View style={s('flex:1;min-width:0')}>
              <Text numberOfLines={1} style={s('font-size:12.5px;font-weight:700;color:#17303B')}>{d.title}</Text>
              <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>{d.when}</Text>
            </View>
            <Text style={s('font-size:14px;font-weight:800;color:#FF5E8A;font-variant:tabular-nums')}>{d.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
