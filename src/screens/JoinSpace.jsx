import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function JoinSpace({ vm }) {
  return (
    <View style={s('flex:1;min-height:768px;padding:0 0 40px;background:#FFF6FB')}>
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;padding:6px 18px 6px')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>초대 코드로 참여</Text>
        <View style={s('width:40px')} />
      </View>

      <View style={s('flex:1;padding:14px 24px 0')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:8px')}>초대 코드 (또는 링크)</Text>
        <TextInput value={vm.joinCode} onChangeText={vm.onJoinCode} placeholder="예) bpowPeLX 또는 우리끼리.app/join/…" placeholderTextColor={vm.joinCodeErr ? '#F0A6B0' : '#B7C3CC'} autoCapitalize="none" style={s(`width:100%;border:1.5px solid ${vm.joinCodeErr ? '#E5484D' : '#FFE1EC'};background:${vm.joinCodeErr ? '#FFF2F3' : '#fff'};border-radius:14px;padding:14px 15px;font-size:13px;color:#17303B`)} />

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:18px 0 8px')}>가족 내 호칭</Text>
        <TextInput value={vm.joinNickname} onChangeText={vm.onJoinNickname} placeholder="예) 이모" placeholderTextColor={vm.joinNickErr ? '#F0A6B0' : '#B7C3CC'} style={s(`width:100%;border:1.5px solid ${vm.joinNickErr ? '#E5484D' : '#FFE1EC'};background:${vm.joinNickErr ? '#FFF2F3' : '#fff'};border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;color:#17303B`)} />

        <View style={s('flex:1')} />

        <Pressable onPress={vm.doJoinGroup} disabled={vm.actionLoading} style={s(`height:54px;border-radius:17px;background:${vm.actionLoading ? '#F3C6D5' : '#FF5E8A'};align-items:center;justify-content:center;flex-direction:row;gap:8px`)}>
          {vm.actionLoading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={s('font-size:15px;font-weight:700;color:#fff')}>참여하기</Text>
        </Pressable>
      </View>
    </View>
  )
}
