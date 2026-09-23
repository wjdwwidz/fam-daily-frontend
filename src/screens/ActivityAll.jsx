import { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import ActivityRow from '../components/ActivityRow.jsx'

import { useVm } from '../vm/useVm.js'

// 최근 활동 '더보기' — 홈은 5개만 보여주고, 여기서 더 길게 본다.
export default function ActivityAll() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadActivityAll() }, [groupId])
  // 화면을 떠날 때 홈이 다시 5개만 받도록 되돌린다 (홈에 들어가면 loadActivity 가 다시 돈다)

  const items = vm.recentActivity
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>최근 활동</Text>
      </View>
      <Text style={s('font-size:11.3px;color:#9DB2BD;margin:0 hair 2xl')}>
        {vm.activityLoading && items.length === 0 ? '불러오는 중…' : '가족이 남긴 것들을 최신순으로'}
      </Text>

      {!vm.activityLoading && items.length === 0 && (
        <Text style={s('padding:6xl 0;text-align:center;font-size:12.5px;color:#9DB2BD')}>아직 활동이 없어요</Text>
      )}

      <View style={s('background:rgba(255,255,255,0.45);border:1px solid rgba(255,225,236,0.6);border-radius:26px;padding:hair 3xl')}>
        {items.map((a, i) => (
          <ActivityRow key={a.key} a={a} last={i === items.length - 1} />
        ))}
      </View>
    </View>
  )
}
