import { View, Text, Image, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function Qna() {
  const vm = useVm()
  const q = vm.todayQ
  return (
    <>
      <View style={s('display:flex;align-items:flex-end;justify-content:space-between;margin:0 hair 3xl')}>
        <Text style={s('font-size:11.3px;color:#6A7E88')}>하루 한 개, 서로를 알아가요 🌱</Text>
        <Pressable onPress={vm.openQnaHistory}>
          <Text style={s('font-size:11.5px;color:#B4C1CA;font-weight:600')}>전체보기</Text>
        </Pressable>
      </View>

      {q.empty ? (
        <View style={s('margin-top:lg;background:#FCEEF4;border-radius:22px;padding:7xl 6xl;align-items:center')}>
          <Text style={s('font-size:34px;margin-bottom:lg')}>🌱</Text>
          <Text style={s('font-size:15px;font-weight:800;color:#17303B;text-align:center;line-height:1.5')}>아직 질문이 없어요</Text>
          <Text style={s('font-size:12px;color:#8A98A2;text-align:center;margin-top:sm;line-height:1.6')}>첫 질문을 올리고{'\n'}가족의 답변을 모아보세요</Text>
          <Pressable onPress={vm.openQuestion} style={s('margin-top:ctaTop;flex-direction:row;align-items:center;gap:sm;background:#FF5E8A;border-radius:15px;padding:2xl 6xl')}>
            <Text style={s('color:#fff;font-size:14px;font-weight:800;line-height:1')}>＋</Text>
            <Text style={s('color:#fff;font-size:13.5px;font-weight:700')}>첫 질문 내기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={s('background:#fff;border:1px solid #FFE1EC;border-radius:20px;padding:4xl;margin-bottom:2xl')}>
            <Text style={s('font-size:11.5px;font-weight:800;color:#FF5E8A;letter-spacing:0.5px')}>{q.no} · 오늘의 질문</Text>
            <Text style={s('font-size:19px;font-weight:600;color:#17303B;margin-top:lg;line-height:1.4;letter-spacing:-0.3px')}>{q.q}</Text>
          </View>

          <Pressable onPress={vm.openAnswer} style={s('display:flex;align-items:center;gap:xl;cursor:pointer;background:#FCEEF4;border-radius:16px;padding:xl 2xl;margin-bottom:md')}>
            <View style={s(`width:40px;height:40px;border-radius:50%;overflow:hidden;background:${vm.myColor};display:flex;align-items:center;justify-content:center;flex:0 0 auto`)}>
              {vm.myPhoto ? <Image source={{ uri: vm.myPhoto }} style={s('width:40px;height:40px')} resizeMode="cover" /> : <Text style={s('color:#fff;font-weight:800;font-size:14px')}>{String(vm.myNickname).slice(0, 1)}</Text>}
            </View>
            <Text style={s('flex:1;font-size:12.6px;color:#B0808F;font-weight:600')}>나도 오늘의 답변을 남겨보세요…</Text>
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF5E8A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" />
              <Path d="M13 7 L17 11" />
            </Svg>
          </Pressable>

          <Text style={s('margin:5xl hair hair;font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px')}>가족들의 답변</Text>
          {q.answered.length === 0 ? (
            <Text style={s('padding:3xl hair;font-size:12.5px;color:#9DB2BD')}>아직 답변이 없어요. 첫 답변을 남겨보세요 ✍️</Text>
          ) : (
            <View style={s('display:flex;flex-direction:column')}>
              {q.answered.map((a, i) => (
                <View key={i} style={s('background:#FCEEF4;border-radius:16px;padding:2xl;margin-bottom:lg')}>
                  <View style={s('display:flex;align-items:center;gap:lg;margin-bottom:lg')}>
                    <View style={s(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${a.by.c}`)}>
                      <Text style={s('color:#fff;font-weight:700;font-size:12.5px')}>{a.by.ini}</Text>
                    </View>
                    <Text style={s('font-size:12.6px;font-weight:700;color:#17303B')}>{a.by.name}</Text>
                    <View style={s('flex-direction:row;align-items:center;gap:lg;margin-left:auto')}>
                      <Text style={s('font-size:10.5px;color:#B4C1CA')}>{a.time}</Text>
                      {a.mine && (
                        <Pressable onPress={() => vm.startEditAnswer(a)}>
                          <Text style={s('font-size:10.5px;font-weight:700;color:#FF5E8A')}>수정</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  <Text style={s('font-size:13px;color:#3F4E58;line-height:1.6')}>{a.text}</Text>
                </View>
              ))}
            </View>
          )}

          {vm.pastQs.length > 0 && (
            <View style={s('margin-top:6xl;background:#FCEEF4;border-radius:20px;padding:xs 3xl md')}>
              <Text style={s('padding:2xl 0 xs;font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px')}>지난 문답</Text>
              <View style={s('display:flex;flex-direction:column')}>
                {vm.pastQs.map((p, i) => (
                  <View key={i} style={s('display:flex;align-items:center;gap:xl;padding:2xl 0;border-bottom:1px solid #F3DCE6;cursor:pointer')}>
                    <View style={s('width:32px;text-align:center;flex:0 0 auto')}>
                      <Text style={s('font-size:8px;font-weight:700;color:#B4C1CA')}>Q</Text>
                      <Text style={s('font-size:15px;font-weight:800;color:#FF5E8A;line-height:1.1')}>{p.day}</Text>
                    </View>
                    <View style={s('flex:1;min-width:0')}>
                      <Text style={s('font-size:12.6px;font-weight:700;color:#17303B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')} numberOfLines={1}>{p.q}</Text>
                      <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>답변 {p.count}개</Text>
                    </View>
                    <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M9 6 L15 12 L9 18" />
                    </Svg>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </>
  )
}
