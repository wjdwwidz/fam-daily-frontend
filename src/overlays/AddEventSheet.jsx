import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import WheelChip from '../components/WheelChip.jsx'

import { useVm } from '../vm/useVm.js'

// 년·월·일 칩 셋 (일상 날짜와 같은 모양)
function DateChips({ wheel, onPart }) {
  return (
    <View style={s('flex-direction:row;align-items:center;gap:sm')}>
      <WheelChip items={wheel.years} value={wheel.y} unit="년" width={84} onChange={(n) => onPart('y', n)} />
      <WheelChip items={wheel.months} value={wheel.m} unit="월" onChange={(n) => onPart('m', n)} />
      <WheelChip items={wheel.days} value={wheel.d} unit="일" onChange={(n) => onPart('d', n)} />
    </View>
  )
}

// 일정 추가·수정 — 달력에서 연다. 가족 공용이라 누가 적었든 고치고 지울 수 있다.
export default function AddEventSheet() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeEvent} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;flex-direction:row;align-items:flex-end')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')} />
        <Text style={s('font-size:15.7px;font-weight:800;color:#17303B;margin-bottom:labelGap')}>{vm.eventIsEdit ? '일정 수정' : '일정 추가'}</Text>
        <TextInput
          value={vm.eventTitle}
          onChangeText={vm.onEventTitle}
          maxLength={100}
          placeholder="일정 이름 (예: 할머니 생신)"
          placeholderTextColor="#9DB2BD"
          style={s('width:100%;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.1px;font-family:inherit;color:#17303B')}
        />

        {/* 하루 / 기간 */}
        <View style={s('flex-direction:row;gap:sm;background:#FFF0F5;border-radius:13px;padding:xs;margin-top:xl')}>
          <Pressable onPress={vm.setOneDay} style={s(`flex:1;height:36px;border-radius:10px;align-items:center;justify-content:center;background:${vm.oneDayBg}`)}>
            <Text style={s(`font-size:12.2px;font-weight:700;color:${vm.oneDayColor}`)}>하루</Text>
          </Pressable>
          <Pressable onPress={vm.setRange} style={s(`flex:1;height:36px;border-radius:10px;align-items:center;justify-content:center;background:${vm.rangeBg}`)}>
            <Text style={s(`font-size:12.2px;font-weight:700;color:${vm.rangeColor}`)}>기간</Text>
          </Pressable>
        </View>

        {/* 날짜 — 칩을 누르면 휠이 떠서 굴려 고른다 (이름표는 칩 위에 — 좁은 폰에서 밀리지 않게) */}
        <View style={s('margin-top:xl;gap:md')}>
          <View style={s('gap:xs')}>
            <Text style={s('font-size:10.5px;color:#9DB2BD')}>{vm.isRange ? '시작' : '날짜'}</Text>
            <DateChips wheel={vm.eventFromWheel} onPart={(part, n) => vm.setEventDatePart('from', part, n)} />
          </View>
          {vm.isRange && (
            <View style={s('gap:xs')}>
              <Text style={s('font-size:10.5px;color:#9DB2BD')}>끝</Text>
              <DateChips wheel={vm.eventToWheel} onPart={(part, n) => vm.setEventDatePart('to', part, n)} />
            </View>
          )}
        </View>

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:4xl hair xl')}>색상 <Text style={s('font-weight:500;color:#9DB2BD')}>· 일정 종류를 색으로 구분해요</Text></Text>
        <View style={s('flex-direction:row;justify-content:space-between;padding:0 hair')}>
          {/* 색만 고른다 — 이름표(가족 모임·병원 …)는 두지 않는다 */}
          {vm.eventCats.map((k) => (
            <Pressable key={k.label} onPress={k.pick} accessibilityLabel={k.label} style={s('align-items:center')}>
              <View style={s(k.swStyle)}><Text style={s('color:#fff;font-size:18px;font-weight:800')}>{k.sel ? '✓' : ''}</Text></View>
            </Pressable>
          ))}
        </View>

        {!!vm.eventError && <Text style={s('font-size:12px;color:#E5484D;margin-top:2xl;text-align:center')}>{vm.eventError}</Text>}

        <Pressable onPress={vm.saveEvent} disabled={vm.eventSaving} style={s(`margin-top:ctaTop;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;opacity:${vm.eventSaving ? 0.7 : 1}`)}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>{vm.eventSaving ? '저장 중…' : vm.eventIsEdit ? '수정하기' : '추가하기'}</Text>
        </Pressable>
        {/* 수정할 때만 — 휴지통 (달력 목록과 같은 모양) */}
        {!!vm.eventRemove && (
          <Pressable onPress={vm.eventRemove} hitSlop={10} accessibilityLabel="이 일정 지우기" style={s('align-self:center;width:44px;height:44px;border-radius:14px;align-items:center;justify-content:center;margin-top:md;cursor:pointer')}>
            <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="#B4C1CA" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" />
              <Path d="M10 11 v6 M14 11 v6" />
            </Svg>
          </Pressable>
        )}
      </Pressable>
    </Pressable>
  )
}
