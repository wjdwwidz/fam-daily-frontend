import { View, Text, Pressable } from 'react-native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'

function Icon({ name, color }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', color }
  if (name === 'home') return <Svg viewBox="0 0 24 24" width={23} height={23} {...common}><Path d="M4 11.5 L12 4.5 L20 11.5" /><Path d="M6 10.2 V20 H18 V10.2" /></Svg>
  if (name === 'dict') return <Svg viewBox="0 0 24 24" width={23} height={23} {...common}><Path d="M12 5.5 C10 4.4 7 4.4 4.5 5.2 V18.4 C7 17.6 10 17.6 12 18.8" /><Path d="M12 5.5 C14 4.4 17 4.4 19.5 5.2 V18.4 C17 17.6 14 17.6 12 18.8" /></Svg>
  if (name === 'qna') return <Svg viewBox="0 0 24 24" width={23} height={23} {...common}><Path d="M4.5 5.5 h15 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1 -1.5 1.5 H10 l-4 3.5 v-3.5 H4.5 A1.5 1.5 0 0 1 3 15 V7 A1.5 1.5 0 0 1 4.5 5.5 Z" /><Path d="M9 10.5 h6" /><Path d="M9 13.5 h4" /></Svg>
  if (name === 'gallery') return <Svg viewBox="0 0 24 24" width={23} height={23} {...common}><Rect x="4" y="5" width="16" height="14" rx="2.5" /><Circle cx="9" cy="10" r="1.6" /><Path d="M5 17.5 L10 12.5 L13.5 16 L16.5 13 L19 15.5" /></Svg>
  return <Svg viewBox="0 0 24 24" width={23} height={23} {...common}><Circle cx="9.5" cy="8" r="3" /><Path d="M4 19 C4 15.7 6.5 14 9.5 14 C12.5 14 15 15.7 15 19" /><Circle cx="17" cy="9" r="2.3" /></Svg>
}

import { useVm } from '../vm/useVm.js'
import { SHOW_UNFINISHED } from '../lib/features.js'

export default function Nav() {
  const vm = useVm()
  const tabs = [
    { key: 'home', label: '홈', onPress: vm.goHome, color: vm.navHome },
    { key: 'dict', label: '사전', onPress: vm.goDict, color: vm.navDict },
    { key: 'qna', label: '문답', onPress: vm.goQna, color: vm.navQna },
    SHOW_UNFINISHED && { key: 'gallery', label: '추억', onPress: vm.goGallery, color: vm.navGallery },
    { key: 'members', label: '가족', onPress: vm.goMembers, color: vm.navMembers },
  ].filter(Boolean)
  return (
    <>
      <View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 74,
          backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: 1, borderTopColor: '#E4EEF4',
          flexDirection: 'row', alignItems: 'flex-start', paddingTop: 11, paddingHorizontal: 4, zIndex: 20,
        }}
      >
        {tabs.map((t) => (
          <Pressable key={t.key} onPress={t.onPress} style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 4 }}>
            <Icon name={t.key === 'members' ? 'members' : t.key} color={t.color} />
            <Text style={{ fontSize: 10.5, fontWeight: '600', color: t.color }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {vm.isGallery && (
        <Pressable onPress={vm.goUpload} style={{ position: 'absolute', right: 18, bottom: 88, width: 60, height: 60, borderRadius: 22, backgroundColor: '#FF5E8A', alignItems: 'center', justifyContent: 'center', zIndex: 25, shadowColor: '#FF5E8A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 17, elevation: 8 }}>
          <Svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 5 V19" /><Path d="M5 12 H19" /></Svg>
        </Pressable>
      )}
      {vm.isDict && (
        <Pressable onPress={vm.startAddWord} style={{ position: 'absolute', right: 18, bottom: 88, width: 60, height: 60, borderRadius: 22, backgroundColor: '#FF5E8A', alignItems: 'center', justifyContent: 'center', zIndex: 25, shadowColor: '#FF5E8A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 17, elevation: 8 }}>
          <Svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 5 V19" /><Path d="M5 12 H19" /></Svg>
        </Pressable>
      )}
    </>
  )
}
