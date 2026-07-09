import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function Profile({ vm }) {
  return (
    <View style={s('padding:0 0 40px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:6px 18px 6px')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>내 프로필</Text>
        <View style={s('width:40px')}></View>
      </View>

      <View style={s('display:flex;flex-direction:column;align-items:center;padding:14px 20px 6px')}>
        <View style={s('position:relative;width:104px;height:104px')}>
          <View style={s('width:104px;height:104px;border-radius:50%;border:3px solid #FF5E8A;overflow:hidden;background:#FF5E8A;position:relative')}>
            <View style={s('position:absolute;inset:0;display:flex;align-items:center;justify-content:center')}>
              <Text style={s('color:#fff;font-weight:800;font-size:34px')}>서</Text>
            </View>
          </View>
          <View style={s('position:absolute;right:0;bottom:2px;width:32px;height:32px;border-radius:50%;background:#fff;border:1px solid #FFE1EC;box-shadow:0 4px 10px rgba(255,94,138,0.2);display:flex;align-items:center;justify-content:center;color:#FF5E8A')}>
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A">
              <Path d="M4 8 h3 l1.5 -2 h7 l1.5 2 h3 v11 h-16 z" />
              <Circle cx={12} cy={13} r={3.3} />
            </Svg>
          </View>
        </View>
        <Text style={s('font-size:11px;color:#9DB2BD;margin-top:10px')}>사진을 눌러 바꿔보세요</Text>
      </View>

      <View style={s('padding:14px 20px 0')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:8px')}>이름</Text>
        <TextInput value="김서연" placeholderTextColor="#9DB2BD" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:18px 0 8px')}>가족 내 호칭</Text>
        <TextInput value="엄마" placeholderTextColor="#9DB2BD" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:14px 15px;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:18px 0 8px')}>오늘의 한마디</Text>
        <View style={s('display:flex;align-items:center;gap:10px;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:6px 6px 6px 15px')}>
          <TextInput value="오늘 도윤이랑 공원 다녀왔어요" placeholderTextColor="#9DB2BD" style={s('flex:1;border:none;outline:none;background:transparent;font-size:13.1px;font-family:inherit;color:#17303B')} />
          <Text style={s('width:38px;height:38px;border-radius:11px;background:#FFF0F5;display:flex;align-items:center;justify-content:center;font-size:18px;flex:0 0 auto')}>😊</Text>
        </View>

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:18px 0 10px')}>내 프로필 색</Text>
        <View style={s('display:flex;gap:12px;padding:0 2px')}>
          <View style={s('width:38px;height:38px;border-radius:50%;background:#FF5E8A;border:3px solid #17303B')}></View>
          <View style={s('width:38px;height:38px;border-radius:50%;background:#A66CFF;border:3px solid transparent')}></View>
          <View style={s('width:38px;height:38px;border-radius:50%;background:#FF9F43;border:3px solid transparent')}></View>
          <View style={s('width:38px;height:38px;border-radius:50%;background:#4D7CFE;border:3px solid transparent')}></View>
          <View style={s('width:38px;height:38px;border-radius:50%;background:#22C4A6;border:3px solid transparent')}></View>
        </View>

        <Pressable onPress={vm.back} style={s('margin-top:26px;height:54px;border-radius:17px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;')}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>저장하기</Text>
        </Pressable>
      </View>
    </View>
  )
}
