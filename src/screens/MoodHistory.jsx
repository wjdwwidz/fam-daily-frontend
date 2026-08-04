import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function MoodHistory() {
  const vm = useVm()
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 4xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>지난 한마디</Text>
      </View>
      <View>
        {vm.moodHistory.map((g, i) => (
          <View key={i}>
            <View style={s('display:flex;align-items:center;gap:lg;margin:2xl hair xs')}>
              <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.2px')}>{g.date}</Text>
              <View style={s('flex:1;height:1px;background:#F3DEE8')}></View>
            </View>
            {g.items.map((h, j) => (
              <View key={j} style={s('display:flex;align-items:flex-start;gap:xl;padding:lg hair;border-bottom:1px solid #F3EAF0')}>
                <View style={s(`width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex:0 0 auto;background:${h.c}`)}>
                  <Text style={s('color:#fff;font-size:11px;font-weight:700')}>{h.ini}</Text>
                </View>
                <View style={s('flex:1;min-width:0')}>
                  <View style={s('flex-direction:row;align-items:baseline;gap:sm')}>
                    <Text style={s('font-size:12px;color:#17303B;font-weight:700')}>{h.name}</Text>
                    <Text style={s('font-size:10px;color:#C0B3BB')}>{h.when}</Text>
                  </View>
                  <Text style={s('font-size:12.5px;color:#3A4A54;margin-top:xs;line-height:1.5')}>{h.text}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}
