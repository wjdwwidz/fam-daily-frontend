import { View, Text, Pressable, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Photo from '../components/Photo.jsx'

const GRID_GAP = 6

// 사진마다 높이가 달라서 행으로 맞추면 빈 칸이 생긴다.
// 열마다 따로 쌓는(메이슨리) 방식으로 원본 비율을 그대로 보여준다.
function toColumns(list, n) {
  const cols = Array.from({ length: n }, () => [])
  list.forEach((item, i) => cols[i % n].push(item))
  return cols
}

import { useVm } from '../vm/useVm.js'

export default function Gallery() {
  const vm = useVm()
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px;margin:sm hair lg')}>일상</Text>

      {/* 폴더 탭 — 선택된 폴더가 앞으로, 나머지는 뒤로 넘어가 겹치는 느낌 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'flex-end', paddingTop: 16, paddingHorizontal: 4 }}
      >
        {vm.galleryTabs.map((t, i) => (
          <Pressable
            key={i}
            onPress={t.pick}
            style={{
              marginLeft: i === 0 ? 0 : -14,
              zIndex: t.sel ? 30 : 20 - i,
              elevation: t.sel ? 6 : 0,
              paddingHorizontal: 24,
              height: t.sel ? 50 : 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: t.sel ? t.bg : '#F1DDE7',
              backgroundColor: t.sel ? t.bg : '#FBEDF3',
              ...(t.sel
                ? { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 7 }
                : {}),
            }}
          >
            <Text style={{ fontSize: t.sel ? 16 : 13.5, fontWeight: '400', color: t.sel ? '#fff' : '#C39BB0' }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {/* 폴더 몸통 — 탭이 얹혀 있는 서랍 느낌 */}
      <View style={{ height: 8, backgroundColor: '#FBEDF3', borderRadius: 4, marginTop: -2, marginBottom: 14 }} />

      {vm.isCards && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {toColumns(vm.galleryMedia, 2).map((col, c) => (
            <View key={c} style={[s('row-gap:xl'), { width: '48.5%' }]}>
              {col.map((g, i) => (
                <Pressable key={i} onPress={g.open} style={s('background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:26px;overflow:hidden;')}>
                  <View style={{ position: 'relative' }}>
                    <Photo uri={g.coverUrl} fallbackRatio={g.isVideo ? 3 / 4 : 4 / 3} />
                    {g.count > 1 && (
                      <View style={s('position:absolute;right:8px;top:8px;background:rgba(0,0,0,0.45);border-radius:999px;padding:hair md')}>
                        <Text style={s('color:#fff;font-size:10px;font-weight:700')}>{g.count}</Text>
                      </View>
                    )}
                    {g.isVideo && (
                      <View style={s('position:absolute;inset:0;display:flex;align-items:center;justify-content:center')}>
                        <View style={s('width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center')}>
                          <Svg viewBox="0 0 24 24" width={18} height={18} fill="#17303B" stroke="none" style={{ marginLeft: 2 }}>
                            <Path d="M8 5 L19 12 L8 19 Z" />
                          </Svg>
                        </View>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}

      {vm.isGrid && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', columnGap: GRID_GAP }}>
          {toColumns(vm.galleryMedia, 3).map((col, c) => (
            <View key={c} style={{ flex: 1, rowGap: GRID_GAP }}>
              {col.map((g, i) => (
                <Pressable key={i} onPress={g.open} style={{ position: 'relative' }}>
                  <Photo uri={g.coverUrl} radius={12} fallbackRatio={g.isVideo ? 3 / 4 : 1} />
                  {g.count > 1 && (
                    <View style={s('position:absolute;right:5px;bottom:5px;background:rgba(0,0,0,0.45);border-radius:999px;padding:hair sm')}>
                      <Text style={s('color:#fff;font-size:9.5px;font-weight:700')}>{g.count}</Text>
                    </View>
                  )}
                  {g.isVideo && (
                    <View style={s('position:absolute;right:5px;top:5px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center')}>
                      <Svg viewBox="0 0 24 24" width={11} height={11} fill="#fff" stroke="none" style={{ marginLeft: 1 }}>
                        <Path d="M8 5 L19 12 L8 19 Z" />
                      </Svg>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}

      {vm.galleryEmpty && (
        <Text style={s('text-align:center;padding:56px 5xl;color:#B4C1CA;font-size:12.8px;line-height:1.7')}>아직 올린 일상이 없어요.{'\n'}첫 일상을 남겨보세요</Text>
      )}
    </View>
  )
}
