import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function LinkSheet() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeLinkSheet} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:46;display:flex;align-items:flex-end;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:20px 20px 28px;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 18px')}></View>
        <Text style={s('font-size:16px;font-weight:800;color:#17303B')}>초대 링크로 참여</Text>
        <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:5px;margin-bottom:16px')}>가족에게 받은 초대 링크를 붙여넣어 주세요</Text>
        <View style={s('display:flex;align-items:center;gap:8px;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:6px 6px 6px 15px')}>
          <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#12B5F0" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 14.5 L14.5 9.5" /><Path d="M11 7.5 L12.7 5.8 A3.2 3.2 0 0 1 18.2 11.3 L16.5 13" /><Path d="M13 16.5 L11.3 18.2 A3.2 3.2 0 0 1 5.8 12.7 L7.5 11" /></Svg>
          <TextInput placeholder="우리끼리.app/join/..." placeholderTextColor="#9DB2BD" style={s('flex:1;border:none;outline:none;background:transparent;font-size:12.6px;font-family:inherit;color:#17303B')} />
          <Text style={s('height:36px;padding:0 14px;border-radius:11px;background:#FFF0F5;color:#FF5E8A;display:flex;align-items:center;font-size:12px;font-weight:700;cursor:pointer;flex:0 0 auto')}>붙여넣기</Text>
        </View>
        <Pressable onPress={vm.finishOnboard} style={s('margin-top:20px;height:54px;border-radius:17px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;cursor:pointer')}>
          <Text style={s('font-size:15px;font-weight:700;color:#fff')}>참여하기</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
