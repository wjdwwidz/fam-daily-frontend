import { useState } from 'react'
import { Image, View } from 'react-native'

// 사진을 원본 비율 그대로 보여준다.
//
// 고정 높이 박스 + resizeMode="cover" 로 그리면 위아래(또는 좌우)가 잘린다.
// 여기서는 onLoad 로 실제 크기를 받아 aspectRatio 를 맞추므로 잘리지 않는다.
// 비율을 알기 전에는 fallback 비율로 자리만 잡아 레이아웃이 튀지 않게 한다.
export default function Photo({ uri, fallbackRatio = 4 / 3, radius = 0, background = '#FCEEF4', style }) {
  const [ratio, setRatio] = useState(null)
  return (
    <View
      style={[
        { width: '100%', aspectRatio: ratio || fallbackRatio, borderRadius: radius, overflow: 'hidden', backgroundColor: background },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        onLoad={(e) => {
          const src = e?.nativeEvent?.source
          if (src?.width && src?.height) setRatio(src.width / src.height)
        }}
      />
    </View>
  )
}
