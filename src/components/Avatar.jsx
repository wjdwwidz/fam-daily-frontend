import { View, Text, Image } from 'react-native'

// 사람 아바타 — 한 군데서만 그린다.
//
//   사진 있음 → 사진
//   사진 없음 → 흰 배경 + 검은 앞글자 (사람마다 색이 다르지 않다)
//
// 예전엔 5색 해시로 사람마다 색을 줬는데, 화면마다 아바타를 따로 그리다 보니
// 같은 사람이 탭마다 다른 색으로 보였다. 이 컴포넌트로 모아 통일한다.

const BG = '#fff'
const BORDER = '#EADCE2' // 흰 카드 위에서 아바타가 묻히지 않게
const TEXT = '#17303B' // 앱 본문 색(거의 검정)

export default function Avatar({ photoUrl, ini, size = 40, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: BG,
          borderWidth: 1,
          borderColor: BORDER,
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 0,
          flexShrink: 0,
        },
        style,
      ]}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ color: TEXT, fontWeight: '700', fontSize: Math.round(size * 0.42) }}>
          {ini}
        </Text>
      )}
    </View>
  )
}
