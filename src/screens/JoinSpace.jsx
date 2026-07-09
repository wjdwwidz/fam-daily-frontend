import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function JoinSpace({ vm }) {
  return (
    <View style={s('min-height:768px;padding:0 0 40px;background:#FFF6FB')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:6px 18px 6px')}>
        <Pressable onPress={vm.goSpace} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>초대 링크로 참여</Text>
        <View style={s('width:40px')} />
      </View>
      <View style={s('padding:14px 24px 0')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:8px')}>초대 링크</Text>
        <View style={s('display:flex;align-items:center;gap:8px;border:1px solid #FFE1EC;background:#fff;border-radius:14px;padding:6px 6px 6px 15px')}>
          <TextInput value="우리끼리.app/join/서연네" style={s('flex:1;border:none;outline:none;background:transparent;font-size:12.6px;font-family:inherit;color:#17303B')} />
          <Text style={s('height:36px;padding:0 14px;border-radius:11px;background:#FFF0F5;color:#FF5E8A;display:flex;align-items:center;font-size:12px;font-weight:700;cursor:pointer;flex:0 0 auto')}>붙여넣기</Text>
        </View>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:22px 0 8px')}>이름</Text>
        <TextInput value="이서진" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#fff;border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:16px 0 8px')}>가족 내 호칭</Text>
        <TextInput value="이모" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#fff;border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />
        <Pressable onPress={vm.finishOnboard} style={s('margin-top:28px;height:54px;border-radius:17px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;cursor:pointer')}>
          <Text style={s('font-size:15px;font-weight:700;color:#fff')}>참여하기</Text>
        </Pressable>
      </View>
    </View>
  )
}
