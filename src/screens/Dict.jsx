import { View, Text, Pressable } from 'react-native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function Dict() {
  const vm = useVm()
  return (
    <View style={s('padding:8px 20px 110px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;margin:6px 2px 4px')}>
        <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>가족 사전</Text>
        <Pressable onPress={vm.openSearch} style={s('width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid #FFE1EC;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FF5E8A')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Circle cx={11} cy={11} r={6} /><Path d="M20 20 L16 16" /></Svg>
        </Pressable>
      </View>

      <View style={s('display:flex;align-items:center;gap:6px;margin:0 2px 12px;font-size:11px;color:#9DB2BD;font-weight:600')}>
        <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#C6A8FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M7 5 V19" /><Path d="M4 8 L7 5 L10 8" /><Path d="M14 16 h6" /><Path d="M14 11 h5" /><Path d="M14 6 h4" /></Svg>
        <Text style={s('font-size:11px;color:#9DB2BD;font-weight:600')}>가나다순 · ㄱ → ㅎ</Text>
      </View>
      {vm.dictGroups.map((grp, i) => (
        <View key={i}>
          <View style={s('display:flex;align-items:center;gap:10px;margin:18px 2px 10px')}>
            <View style={s('width:28px;height:28px;border-radius:5px;background:#fff;border:1.5px solid #FF5E8A;align-items:center;justify-content:center;flex:0 0 auto')}>
              <Text style={s('color:#FF5E8A;font-size:12.2px;font-weight:800')}>{grp.cho}</Text>
            </View>
            <View style={s('flex:1;height:2px;border-radius:2px;background:#FFE1EC')}></View>
          </View>
          <View style={s('background:#fff;border:1px solid #F3DCE4;border-radius:2px;overflow:hidden')}>
            {grp.items.map((w, j) => (
              <Pressable key={j} onPress={w.open} style={s('display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;border-bottom:1px solid #FDECF2')}>
                <Text style={s('font-size:14.8px;font-weight:800;color:#17303B;flex:0 0 auto')}>{w.term}</Text>
                <Text numberOfLines={1} style={s('font-size:11.3px;font-weight:500;color:#B7C1CA;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>“{w.reading}”</Text>
                {w.photo && (<Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#FF9EBB" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={s('flex:0 0 auto')}><Rect x={4} y={6} width={16} height={13} rx={2.5} /><Circle cx={9} cy={11} r={1.5} /><Path d="M5 17 L10 13 L13 15.5 L16 13 L19 15.5" /></Svg>)}
                <View style={s(`width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${w.by.c}`)}>
                  <Text style={s('color:#fff;font-size:11px;font-weight:700')}>{w.by.ini}</Text>
                </View>
                <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s('flex:0 0 auto')}><Path d="M9 6 L15 12 L9 18" /></Svg>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}
