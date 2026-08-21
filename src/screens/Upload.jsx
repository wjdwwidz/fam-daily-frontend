import { View, Text, Pressable, ScrollView, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'

import { useVm } from '../vm/useVm.js'

export default function Upload() {
  const vm = useVm()
  return (
    <View style={s('padding:0 0 8xl')}>
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;padding:sm 4xl 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>새 일상 올리기</Text>
        <View style={s('width:40px')}></View>
      </View>
      <View style={s('padding:sm screenX 0')}>
        <View style={s('margin-top:3xl;height:200px;border-radius:28px;border:2px dashed #BEE6F7;background:#F3FAFE;flex-direction:column;align-items:center;justify-content:center;gap:xl')}>
          <View style={s('width:60px;height:60px;border-radius:26px;background:#FFF0F5;align-items:center;justify-content:center;color:#FF5E8A')}>
            <Svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Path d="M12 16 V5" /><Path d="M8 9 L12 5 L16 9" /><Path d="M5 15 v3 a1 1 0 0 0 1 1 h12 a1 1 0 0 0 1 -1 v-3" /></Svg>
          </View>
          <View style={s('text-align:center')}>
            <Text style={s('font-size:12.6px;font-weight:700;color:#17303B')}>{vm.uploadHint}</Text>
            <Text style={s('font-size:11px;color:#9DB2BD;margin-top:xs')}>갤러리에서 선택하거나 촬영하세요</Text>
          </View>
        </View>
        <Text style={s('margin-top:4xl;font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:md')}>설명</Text>
        <TextInput multiline textAlignVertical="top" placeholder="이 순간을 한 줄로 남겨보세요" placeholderTextColor="#9DB2BD" style={s('width:100%;min-height:64px;border:none;outline:none;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:16px;padding:2xl 3xl;font-size:12.2px;font-family:inherit;color:#17303B;resize:none')} />
        <Text style={s('margin-top:4xl;font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:lg')}>함께한 가족 태그</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s('gap:xl;padding-bottom:xs')}>
          {vm.members.map((m, i) => (
            <View key={i} style={s('display:flex;flex-direction:column;align-items:center;gap:sm;flex:0 0 auto')}>
              <Avatar photoUrl={m.photoUrl} ini={m.ini} size={46} style={{ opacity: 0.55 }} />
              <Text style={s('font-size:11px;color:#9DB2BD')}>{m.name}</Text>
            </View>
          ))}
        </ScrollView>
        <Pressable onPress={vm.goHome} style={s('margin:ctaTop 0 ctaBottom;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;flex-direction:row')}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>올리기</Text>
        </Pressable>
      </View>
    </View>
  )
}
