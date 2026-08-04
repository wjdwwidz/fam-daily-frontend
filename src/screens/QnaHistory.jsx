import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function QnaHistory() {
  const vm = useVm()
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>지난 문답</Text>
      </View>
      <Text style={s('font-size:11.3px;color:#9DB2BD;margin:0 hair 2xl')}>지금까지 함께한 {vm.qnaHistoryTotal}개의 질문</Text>
      <View style={s('background:#FCEEF4;border-radius:20px;padding:xs 3xl md')}>
        <View style={s('display:flex;flex-direction:column')}>
          {vm.qnaHistory.map((p, i) => (
            <View key={i} style={s('display:flex;align-items:center;gap:xl;padding:2xl 0;border-bottom:1px solid #F3DCE6;cursor:pointer')}>
              <Text style={s('width:26px;text-align:center;flex:0 0 auto;font-size:15px;font-weight:800;color:#FF5E8A;line-height:1.1')}>{p.no}</Text>
              <View style={s('flex:1;min-width:0')}>
                <Text style={s('font-size:12.6px;font-weight:700;color:#17303B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')} numberOfLines={1}>{p.q}</Text>
                <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>{p.count}명 답변</Text>
              </View>
              <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M9 6 L15 12 L9 18" /></Svg>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
