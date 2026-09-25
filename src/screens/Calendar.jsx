import { useEffect } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 달력 — 가족 일정(생일·약속·여행)을 한 달씩 본다.
// 제목줄은 Record 가 소유하므로 여기선 본문만 그린다.
export default function Calendar() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadEvents() }, [groupId])

  return (
    <View>
      {/* 달 이동 */}
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin:0 hair lg')}>
        <Pressable onPress={vm.prevMonth} hitSlop={8} style={s('width:34px;height:34px;border-radius:11px;align-items:center;justify-content:center;background:#fff;border:1px solid #FFE1EC;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FF5E8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('flex-direction:row;align-items:center;gap:lg')}>
          <Text style={s('font-size:15px;font-weight:800;color:#17303B;font-variant:tabular-nums')}>{vm.calTitle}</Text>
          {/* 다른 달을 보고 있을 때만 — 이번 달로 돌아오는 길 */}
          {!vm.calIsThisMonth && (
            <Pressable onPress={vm.goThisMonth} hitSlop={6} style={s('background:#FFF0F5;border-radius:10px;padding:xs md')}>
              <Text style={s('font-size:10.5px;font-weight:700;color:#FF5E8A')}>오늘로</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={vm.nextMonth} hitSlop={8} style={s('width:34px;height:34px;border-radius:11px;align-items:center;justify-content:center;background:#fff;border:1px solid #FFE1EC;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FF5E8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 5 L16.5 12 L9.5 19" /></Svg>
        </Pressable>
      </View>

      {/* 달력 한 장 */}
      <View style={s('background:#fff;border:1px solid #FFE1EC;border-radius:20px;padding:2xl md 2xl')}>
        <View style={s('flex-direction:row')}>
          {vm.calWeekdays.map((w, i) => (
            <View key={w} style={s('flex:1;align-items:center;padding-bottom:md')}>
              <Text style={s(`font-size:10.5px;font-weight:700;color:${i === 0 ? '#FF8FAE' : '#A9B4BD'}`)}>{w}</Text>
            </View>
          ))}
        </View>
        <View style={s('flex-direction:row;flex-wrap:wrap')}>
          {vm.calCells.map((c) => (
            <View key={c.key} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 5 }}>
              {c.empty ? (
                <View style={s('width:40px;height:56px')} />
              ) : (
                <Pressable onPress={c.pick} style={s(`width:40px;height:56px;border-radius:14px;align-items:center;justify-content:center;gap:xs;cursor:pointer;background:${c.picked ? '#FFF0F5' : 'transparent'};border:1px solid ${c.picked ? '#FFD3E2' : 'transparent'}`)}>
                  {/* 오늘은 분홍 동그라미 */}
                  <View style={s(`width:26px;height:26px;border-radius:50%;align-items:center;justify-content:center;background:${c.today ? '#FF5E8A' : 'transparent'}`)}>
                    <Text style={s(`font-size:12.5px;font-variant:tabular-nums;font-weight:${c.today ? 800 : 600};color:${c.today ? '#fff' : '#3F4E58'}`)}>{c.n}</Text>
                  </View>
                  {/* 그날 일정 — 색 점 (세 개까지) */}
                  <View style={s('flex-direction:row;align-items:center;gap:2px;height:6px')}>
                    {c.dots.map((d) => (
                      <View key={d.key} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: d.c }} />
                    ))}
                    {c.more > 0 && <Text style={s('font-size:8px;color:#B4C1CA')}>+{c.more}</Text>}
                  </View>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 고른 날(없으면 이 달 전체)의 일정 */}
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin:3xl hair md')}>
        <Text style={s('font-size:12.5px;font-weight:700;color:#17303B')}>{vm.calPickedLabel}</Text>
        {vm.calLoading && <Text style={s('font-size:10.5px;color:#9DB2BD')}>불러오는 중…</Text>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s('gap:md;padding-bottom:6xl')}>
        {!vm.calLoading && vm.calDayEvents.length === 0 && (
          <Text style={s('padding:3xl 0;text-align:center;font-size:11.5px;color:#9DB2BD')}>아직 일정이 없어요</Text>
        )}
        {vm.calDayEvents.map((e) => (
          <Pressable key={e.id} onPress={e.edit} style={s('flex-direction:row;align-items:center;gap:lg;background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:xl 2xl;cursor:pointer')}>
            {/* 종류 색 막대 */}
            <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: e.color }} />
            <View style={s('flex:1;min-width:0')}>
              <Text numberOfLines={1} style={s('font-size:13px;font-weight:700;color:#17303B')}>{e.title}</Text>
              <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>
                {e.when}{e.category ? ` · ${e.category}` : ''}{e.byName ? ` · ${e.byName}님` : ''}
              </Text>
            </View>
            <Pressable onPress={e.remove} hitSlop={8}>
              <Text style={s('font-size:11.5px;color:#9DB2BD')}>지우기</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
