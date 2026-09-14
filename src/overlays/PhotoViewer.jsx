import { Image, Pressable, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 사진 원본 보기. vm.openPhotoViewer(url) 로 연다.
// 화면에서는 틀에 맞춰 잘라 보여주더라도, 여기서는 contain 으로 사진 전체를 원본 비율대로 보여준다.
// 아무 곳이나 누르면 닫힌다.
export default function PhotoViewer() {
  const vm = useVm()
  const insets = useSafeAreaInsets()
  return (
    <Pressable onPress={vm.closePhotoViewer} style={s('position:absolute;inset:0;background:rgba(0,0,0,0.92);z-index:70;display:flex;align-items:center;justify-content:center')}>
      <Image source={{ uri: vm.photoViewerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      <Pressable onPress={vm.closePhotoViewer} style={[s('position:absolute;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;cursor:pointer'), { top: insets.top + 12 }]}>
        <Text style={s('color:#fff;font-size:20px')}>×</Text>
      </Pressable>
    </Pressable>
  )
}
