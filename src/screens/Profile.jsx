import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'

import { useVm } from '../vm/useVm.js'

export default function Profile() {
  const vm = useVm()
  return (
    <View style={s('padding:0 0 8xl')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:sm 4xl sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>내 프로필</Text>
        <View style={s('width:40px')}></View>
      </View>

      <View style={s('display:flex;flex-direction:column;align-items:center;padding:2xl 5xl sm')}>
        <Pressable onPress={vm.pickProfilePhoto} style={s('position:relative;width:104px;height:104px')}>
          <View style={s('width:104px;height:104px;position:relative')}>
            <Avatar photoUrl={vm.profilePhoto} ini={String(vm.profileNickname || '나').slice(0, 1)} size={104} />
            {vm.profilePhotoUploading && (
              <View style={s('position:absolute;inset:0;border-radius:50%;background:rgba(23,48,59,0.45);display:flex;align-items:center;justify-content:center')}>
                <Text style={s('color:#fff;font-size:11px;font-weight:700')}>업로드 중…</Text>
              </View>
            )}
          </View>
          <View style={s('position:absolute;right:0;bottom:2px;width:32px;height:32px;border-radius:50%;background:#fff;border:1px solid #FFE1EC;box-shadow:0 4px 10px rgba(255,94,138,0.2);display:flex;align-items:center;justify-content:center;color:#FF5E8A')}>
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A">
              <Path d="M4 8 h3 l1.5 -2 h7 l1.5 2 h3 v11 h-16 z" />
              <Circle cx={12} cy={13} r={3.3} />
            </Svg>
          </View>
        </Pressable>
        <Text style={s('font-size:11px;color:#9DB2BD;margin-top:lg')}>사진을 눌러 바꿔보세요</Text>
      </View>

      <View style={s('padding:2xl screenX 0')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:md')}>이름</Text>
        <TextInput value={vm.profileName} onChangeText={vm.onProfileName} placeholder="이름" placeholderTextColor="#9DB2BD" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:fieldGap 0 labelGap')}>가족 내 호칭</Text>
        <TextInput value={vm.profileNickname} onChangeText={vm.onProfileNickname} placeholder="예: 엄마, 아빠" placeholderTextColor="#9DB2BD" style={s('width:100%;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.5px;font-weight:600;font-family:inherit;color:#17303B')} />

        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:fieldGap 0 labelGap')}>오늘의 한마디</Text>
        <View style={s('display:flex;align-items:center;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:14px;padding:2xl 3xl')}>
          <TextInput value={vm.profileMood} onChangeText={vm.onProfileMood} placeholder="오늘의 한마디를 남겨보세요" placeholderTextColor="#9DB2BD" style={s('flex:1;border:none;outline:none;background:transparent;font-size:13.1px;font-family:inherit;color:#17303B')} />
        </View>

        {vm.profileError && <Text style={s('font-size:12px;color:#E5484D;margin-top:3xl;text-align:center')}>{vm.profileError}</Text>}

        <Pressable onPress={vm.saveProfile} disabled={vm.profileSaving} style={s(`margin:ctaTop 0 ctaBottom;height:54px;border-radius:17px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;opacity:${vm.profileSaving ? 0.7 : 1}`)}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>{vm.profileSaving ? '저장 중…' : '저장하기'}</Text>
        </Pressable>
      </View>
    </View>
  )
}
