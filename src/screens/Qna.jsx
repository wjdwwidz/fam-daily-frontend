import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function Qna({ vm }) {
  return (
    <View style={s('padding:8px 20px 110px')}>
      <Text style={s('margin:6px 2px 4px;font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>가족 문답</Text>
      <View style={s('display:flex;align-items:flex-end;justify-content:space-between;margin:0 2px 16px')}>
        <Text style={s('font-size:11.3px;color:#6A7E88')}>하루 한 개, 서로를 알아가요 🌱</Text>
        <Pressable onPress={vm.openQnaHistory}>
          <Text style={s('font-size:11.5px;color:#B4C1CA;font-weight:600')}>전체보기</Text>
        </Pressable>
      </View>

      <View style={s('padding:2px 2px 20px;border-bottom:1px solid #F0DEE6;margin-bottom:6px')}>
        <Text style={s('font-size:11.5px;font-weight:800;color:#FF5E8A;letter-spacing:0.5px')}>{vm.todayQ.no} · 오늘의 질문</Text>
        <Text style={s('font-size:19px;font-weight:600;color:#17303B;margin-top:10px;line-height:1.4;letter-spacing:-0.3px')}>{vm.todayQ.q}</Text>
        <View style={s('display:flex;align-items:center;gap:10px;margin-top:14px')}>
          <View style={s('display:flex')}>
            {vm.todayQ.answered.map((a, i) => (
              <View key={i} style={s(`width:26px;height:26px;border-radius:50%;border:2px solid #FFF6FB;display:flex;align-items:center;justify-content:center;margin-left:-8px;background:${a.by.c}`)}>
                <Text style={s('color:#fff;font-size:10px;font-weight:700')}>{a.by.ini}</Text>
              </View>
            ))}
          </View>
          <Text style={s('font-size:11.5px;color:#9DB2BD')}>{vm.todayQ.progress}</Text>
        </View>
      </View>

      <Pressable onPress={vm.openAnswer} style={s('margin-top:6px;display:flex;align-items:center;gap:12px;cursor:pointer;padding:8px 2px')}>
        <View style={s('width:40px;height:40px;border-radius:50%;background:#FF5E8A;display:flex;align-items:center;justify-content:center;flex:0 0 auto')}>
          <Text style={s('color:#fff;font-weight:800;font-size:14px')}>서</Text>
        </View>
        <Text style={s('flex:1;font-size:12.6px;color:#B0808F;font-weight:600')}>나도 오늘의 답변을 남겨보세요…</Text>
        <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF5E8A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" />
          <Path d="M13 7 L17 11" />
        </Svg>
      </Pressable>

      <Text style={s('margin:20px 2px 2px;font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px')}>가족들의 답변</Text>
      <View style={s('display:flex;flex-direction:column')}>
        {vm.todayQ.answered.map((a, i) => (
          <View key={i} style={s('padding:15px 2px;border-bottom:1px solid #F0DEE6')}>
            <View style={s('display:flex;align-items:center;gap:10px;margin-bottom:9px')}>
              <View style={s(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${a.by.c}`)}>
                <Text style={s('color:#fff;font-weight:700;font-size:12.5px')}>{a.by.ini}</Text>
              </View>
              <Text style={s('font-size:12.6px;font-weight:700;color:#17303B')}>{a.by.name}</Text>
              <Text style={s('font-size:10.5px;color:#B4C1CA;margin-left:auto')}>{a.time}</Text>
            </View>
            <Text style={s('font-size:13px;color:#3F4E58;line-height:1.6')}>{a.text}</Text>
            <View style={s('display:flex;align-items:center;gap:5px;margin-top:10px')}>
              <Svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" stroke="none" color="#FF5E8A">
                <Path d="M12 20 C12 20 4 15 4 9.2 C4 6.4 6.1 4.8 8.2 4.8 C10 4.8 11.4 6 12 7 C12.6 6 14 4.8 15.8 4.8 C17.9 4.8 20 6.4 20 9.2 C20 15 12 20 12 20 Z" />
              </Svg>
              <Text style={s('color:#FF5E8A;font-size:11.5px;font-weight:700')}>{a.likes}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s('margin-top:26px;background:#FCEEF4;border-radius:20px;padding:4px 16px 8px')}>
        <Text style={s('padding:14px 0 4px;font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px')}>지난 문답</Text>
        <View style={s('display:flex;flex-direction:column')}>
          {vm.pastQs.map((p, i) => (
            <View key={i} style={s('display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #F3DCE6;cursor:pointer')}>
              <View style={s('width:32px;text-align:center;flex:0 0 auto')}>
                <Text style={s('font-size:8px;font-weight:700;color:#B4C1CA')}>DAY</Text>
                <Text style={s('font-size:15px;font-weight:800;color:#FF5E8A;line-height:1.1')}>{p.day}</Text>
              </View>
              <View style={s('flex:1;min-width:0')}>
                <Text style={s('font-size:12.6px;font-weight:700;color:#17303B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')} numberOfLines={1}>{p.q}</Text>
                <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:2px')}>{p.count}명 답변</Text>
              </View>
              <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M9 6 L15 12 L9 18" />
              </Svg>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
