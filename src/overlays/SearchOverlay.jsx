import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function SearchOverlay() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeSearch} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:40;display:flex;flex-direction:column;padding:52px 4xl 0;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('display:flex;align-items:center;gap:lg')}>
        <View style={s('flex:1;display:flex;align-items:center;gap:lg;background:#fff;border-radius:14px;padding:2xl 3xl;box-shadow:0 12px 30px rgba(0,0,0,0.2)')}>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF5E8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="11" cy="11" r="6" />
            <Path d="M20 20 L16 16" />
          </Svg>
          <TextInput autoFocus placeholder="단어 검색" placeholderTextColor="#9DB2BD" style={s('border:none;outline:none;background:transparent;font-size:13.1px;font-family:inherit;color:#17303B;flex:1')} />
        </View>
        <Pressable onPress={vm.closeSearch} style={s('flex:0 0 auto')}>
          <Text style={s('color:#fff;font-size:12.2px;font-weight:700')}>취소</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
