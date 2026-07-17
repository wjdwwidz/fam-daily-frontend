import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function CreateSpace() {
  const vm = useVm()
  return (
    <View style={s('min-height:768px;padding:0 0 40px;background:#FFF6FB')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:6px 18px 6px')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>가족 공간 만들기</Text>
        <View style={s('width:40px')} />
      </View>
      <View style={s('padding:22px 24px 0')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:8px')}>공간 이름</Text>
        <TextInput value={vm.createName} onChangeText={vm.onCreateName} placeholder="예) 서연이네 가족" placeholderTextColor={vm.createNameErr ? '#F0A6B0' : '#B7C3CC'} style={s(`width:100%;border:1.5px solid ${vm.createNameErr ? '#E5484D' : '#FFE1EC'};background:${vm.createNameErr ? '#FFF2F3' : '#fff'};border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;color:#17303B`)} />
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:18px 0 8px')}>내 호칭</Text>
        <TextInput value={vm.createNickname} onChangeText={vm.onCreateNickname} placeholder="예) 엄마" placeholderTextColor={vm.createNickErr ? '#F0A6B0' : '#B7C3CC'} style={s(`width:100%;border:1.5px solid ${vm.createNickErr ? '#E5484D' : '#FFE1EC'};background:${vm.createNickErr ? '#FFF2F3' : '#fff'};border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;color:#17303B`)} />
        <Text style={s('font-size:11px;color:#9DB2BD;margin-top:8px;line-height:1.5')}>공간을 만들면 내가 관리자가 되고,{'\n'}가족을 초대할 수 있어요</Text>
        <Pressable onPress={vm.doCreateGroup} disabled={vm.actionLoading} style={s(`margin-top:24px;height:54px;border-radius:17px;background:${vm.actionLoading ? '#F3C6D5' : '#FF5E8A'};align-items:center;justify-content:center;flex-direction:row;gap:8px`)}>
          {vm.actionLoading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={s('font-size:15px;font-weight:700;color:#fff')}>공간 만들기</Text>
        </Pressable>
      </View>
    </View>
  )
}
