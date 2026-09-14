import { useVideoPlayer, VideoView } from 'expo-video'
import { View } from 'react-native'

// 일상 글 안의 영상 한 개. 탭해서 재생하고, 전체화면도 쓸 수 있다.
// 자동 재생하지 않는다 — 글에 영상이 여러 개면 한꺼번에 소리가 겹친다.
export default function VideoItem({ uri, radius = 0, background = '#000' }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false
  })
  return (
    <View style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: radius, overflow: 'hidden', backgroundColor: background }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        allowsFullscreen
        contentFit="contain"
      />
    </View>
  )
}
