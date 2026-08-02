import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function AddEventSheet() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeAddEvent} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;flex-direction:row;align-items:flex-end')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')} />
        <Text style={s('font-size:15.7px;font-weight:800;color:#17303B;margin-bottom:3xl')}>일정 추가</Text>
        <TextInput placeholder="일정 이름" placeholderTextColor="#9DB2BD" style={s('width:100%;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.1px;font-family:inherit;color:#17303B')} />
        <View style={s('flex-direction:row;gap:sm;background:#FFF0F5;border-radius:13px;padding:xs;margin-top:xl')}>
          <Pressable onPress={vm.setOneDay} style={s(`flex:1;height:36px;border-radius:10px;align-items:center;justify-content:center;background:${vm.oneDayBg}`)}>
            <Text style={s(`font-size:12.2px;font-weight:700;color:${vm.oneDayColor}`)}>하루</Text>
          </Pressable>
          <Pressable onPress={vm.setRange} style={s(`flex:1;height:36px;border-radius:10px;align-items:center;justify-content:center;background:${vm.rangeBg}`)}>
            <Text style={s(`font-size:12.2px;font-weight:700;color:${vm.rangeColor}`)}>기간</Text>
          </Pressable>
        </View>
        {vm.isRange && (
          <>
            <View style={s('flex-direction:row;align-items:center;gap:md;margin-top:xl')}>
              <View style={s('flex:1;flex-direction:row;align-items:center;gap:md;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 2xl')}>
                <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#FF5E8A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Rect x="4" y="5" width="16" height="15" rx="2.5" /><Path d="M4 9.5 h16" /><Path d="M8.5 3 v4" /><Path d="M15.5 3 v4" /></Svg>
                <View><Text style={s('font-size:9.5px;color:#9DB2BD;font-weight:700')}>시작</Text><Text style={s('font-size:12.6px;color:#17303B;font-weight:600')}>7. 25 (토)</Text></View>
              </View>
              <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#C6A8FF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 12 H19" /><Path d="M14 7 L19 12 L14 17" /></Svg>
              <View style={s('flex:1;flex-direction:row;align-items:center;gap:md;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 2xl')}>
                <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#FF5E8A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Rect x="4" y="5" width="16" height="15" rx="2.5" /><Path d="M4 9.5 h16" /><Path d="M8.5 3 v4" /><Path d="M15.5 3 v4" /></Svg>
                <View><Text style={s('font-size:9.5px;color:#9DB2BD;font-weight:700')}>종료</Text><Text style={s('font-size:12.6px;color:#17303B;font-weight:600')}>7. 28 (화)</Text></View>
              </View>
            </View>
            <Text style={s('font-size:10.5px;color:#9DB2BD;margin:md hair 0')}>캘린더에 3박 4일 동안 색으로 이어져 표시돼요</Text>
          </>
        )}
        {vm.isOneDay && (
          <View style={s('flex-direction:row;align-items:center;gap:lg;margin-top:xl;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 3xl')}>
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF5E8A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Rect x="4" y="5" width="16" height="15" rx="2.5" /><Path d="M4 9.5 h16" /><Path d="M8.5 3 v4" /><Path d="M15.5 3 v4" /></Svg>
            <Text style={s('font-size:13.1px;color:#17303B;font-weight:600;flex:1')}>2026. 7. 7 (화)</Text>
            <Text style={s('font-size:11px;color:#9DB2BD')}>오후 7:00</Text>
          </View>
        )}
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:5xl hair xl')}>색상 <Text style={s('font-weight:500;color:#9DB2BD')}>· 일정 종류를 색으로 구분해요</Text></Text>
        <View style={s('flex-direction:row;justify-content:space-between;padding:0 hair')}>
          {vm.eventCats.map((k, i) => (
            <Pressable key={i} onPress={k.pick} style={s('flex-direction:column;align-items:center')}>
              <View style={s(k.swStyle)}><Text>{k.sel && '✓'}</Text></View>
              <Text style={s(k.labelStyle)}>{k.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={vm.closeAddEvent} style={s('margin-top:6xl;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center')}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>추가하기</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
