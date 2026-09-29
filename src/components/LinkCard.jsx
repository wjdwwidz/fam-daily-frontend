import { useState } from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import { hostOf, openLink } from '../lib/links.js'

function LinkIcon({ size = 14, color = '#FF8FAE' }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 14 a4 4 0 0 0 5.7 0 l3-3 a4 4 0 0 0 -5.7 -5.7 l-1 1" />
      <Path d="M14 10 a4 4 0 0 0 -5.7 0 l-3 3 a4 4 0 0 0 5.7 5.7 l1 -1" />
    </Svg>
  )
}

// 링크 카드 — 블로그 글의 링크 블록처럼 썸네일·제목·요약·사이트 이름을 한 덩어리로.
//  - 기본: 썸네일이 위에 크게 (글 상세)
//  - compact: 썸네일이 오른쪽에 작게 (목록·작성 화면)
// 제목을 못 읽은 링크(로그인이 필요한 곳 등)는 사이트 이름과 주소만 보여준다.
export default function LinkCard({ link, compact = false }) {
  const [imgFailed, setImgFailed] = useState(false)
  const site = link.siteName || hostOf(link.url)
  const image = !imgFailed && link.image
  const open = () => openLink(link.url)

  if (!link.title) {
    return (
      <Pressable onPress={open} style={s('flex-direction:row;align-items:center;gap:md;background:#FFF6FA;border:1px solid #FFE1EC;border-radius:14px;padding:lg xl;cursor:pointer')}>
        <LinkIcon />
        <View style={s('flex:1;min-width:0')}>
          <Text numberOfLines={1} style={s('font-size:12px;font-weight:700;color:#17303B')}>{site}</Text>
          <Text numberOfLines={1} style={s('font-size:11px;color:#9DB2BD;margin-top:hair')}>{link.url}</Text>
        </View>
      </Pressable>
    )
  }

  if (compact) {
    return (
      <Pressable onPress={open} style={s('flex-direction:row;align-items:stretch;background:#fff;border:1px solid #FFE1EC;border-radius:14px;overflow:hidden;cursor:pointer')}>
        <View style={s('flex:1;min-width:0;padding:lg xl;justify-content:center')}>
          <Text numberOfLines={2} style={s('font-size:12.5px;font-weight:700;color:#17303B;line-height:1.4')}>{link.title}</Text>
          <View style={s('flex-direction:row;align-items:center;gap:xs;margin-top:xs')}>
            <LinkIcon size={11} color="#B4C1CA" />
            <Text numberOfLines={1} style={s('flex:1;font-size:10.5px;color:#9DB2BD')}>{site}</Text>
          </View>
        </View>
        {!!image && (
          <Image source={{ uri: image }} onError={() => setImgFailed(true)} style={{ width: 72, alignSelf: 'stretch', minHeight: 64, backgroundColor: '#FCEEF4' }} resizeMode="cover" />
        )}
      </Pressable>
    )
  }

  return (
    <Pressable onPress={open} style={s('background:#fff;border:1px solid #FFE1EC;border-radius:16px;overflow:hidden;cursor:pointer')}>
      {!!image && (
        <Image source={{ uri: image }} onError={() => setImgFailed(true)} style={{ width: '100%', aspectRatio: 1.91, backgroundColor: '#FCEEF4' }} resizeMode="cover" />
      )}
      <View style={s('padding:xl 2xl')}>
        <Text numberOfLines={2} style={s('font-size:13.5px;font-weight:800;color:#17303B;line-height:1.4')}>{link.title}</Text>
        {!!link.description && (
          <Text numberOfLines={2} style={s('font-size:12px;color:#6A7E88;line-height:1.5;margin-top:xs')}>{link.description}</Text>
        )}
        <View style={s('flex-direction:row;align-items:center;gap:xs;margin-top:md')}>
          <LinkIcon size={12} color="#B4C1CA" />
          <Text numberOfLines={1} style={s('flex:1;font-size:11px;color:#9DB2BD')}>{site}</Text>
        </View>
      </View>
    </Pressable>
  )
}
