import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'
import Photo from '../components/Photo.jsx'
import VideoItem from '../components/VideoItem.jsx'

import { useVm } from '../vm/useVm.js'

export default function Media() {
  const vm = useVm()
  const m = vm.currentMedia
  if (!m) return null
  return (
    <View style={s('padding:0 0 120px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:sm 4xl 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('width:40px;height:40px')} />
        <View style={s('position:relative')}>
          {/* 삭제는 올린 본인만 (서버도 같은 규칙) */}
          {m.mine ? (
            <>
              <Pressable onPress={vm.toggleMenuMedia} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center')}>
                <Text style={s('color:#8497A1;font-size:17.4px')}>⋯</Text>
              </Pressable>
              {vm.isMenuMedia && (
                <View style={s('position:absolute;right:0;top:46px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;box-shadow:0 12px 30px rgba(255,94,138,0.22);overflow:hidden;z-index:20;min-width:128px')}>
                  <Pressable onPress={vm.deleteMedia} style={s('display:flex;align-items:center;gap:lg;padding:xl 3xl')}>
                    <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#E5484D"><Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" /></Svg>
                    <Text style={s('font-size:13px;font-weight:600;color:#E5484D')}>삭제하기</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={s('width:40px;height:40px')} />
          )}
        </View>
      </View>

      <View style={s('margin:0 5xl;gap:lg')}>
        {m.items.map((it, i) =>
          it.type === 'video'
            ? <VideoItem key={i} uri={it.url} radius={28} />
            : <Photo key={i} uri={it.url} radius={28} />
        )}
      </View>

      <View style={s('padding:4xl screenX 0')}>
        {!!m.title && (
          <Text style={s('font-size:14px;color:#2B3A43;line-height:1.6;margin-bottom:3xl;white-space:pre-wrap')}>{m.title}</Text>
        )}
        <View style={s('display:flex;align-items:center;gap:xl')}>
          <Avatar photoUrl={m.by.photoUrl} ini={m.by.ini} size={38} />
          <View style={s('flex:1')}>
            <Text style={s('font-size:11.7px;font-weight:700;color:#17303B')}>{m.by.name}님이 올림</Text>
            <Text style={s('font-size:11px;color:#9DB2BD')}>{m.date}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
