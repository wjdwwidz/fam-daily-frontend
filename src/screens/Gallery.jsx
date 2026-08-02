import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

// 3열 정사각 셀 크기를 픽셀로 직접 계산 (네이티브에서 aspectRatio+% 조합이 높이를 못 잡는 문제 회피)
const SCREEN_W = Dimensions.get('window').width
const GRID_GAP = 6
const CELL = Math.floor((SCREEN_W - 40 - GRID_GAP * 2) / 3) // 40 = 좌우 패딩(20*2)

import { useVm } from '../vm/useVm.js'

export default function Gallery() {
  const vm = useVm()
  return (
    <View style={s('padding:md 5xl 110px')}>
      <View style={s('margin:sm hair xs')}>
        <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>추억</Text>
      </View>

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
            <Text style={{ fontSize: t.sel ? 16 : 13.5, fontWeight: '800', color: t.sel ? '#fff' : '#C39BB0' }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {/* 폴더 몸통 — 탭이 얹혀 있는 서랍 느낌 */}
      <View style={{ height: 8, backgroundColor: '#FBEDF3', borderRadius: 4, marginTop: -2, marginBottom: 14 }} />

      {vm.isCards && (
        <View style={s('flex-direction:row;flex-wrap:wrap;justify-content:space-between;row-gap:xl')}>
          {vm.galleryMedia.map((g, i) => (
            <Pressable key={i} onPress={g.open} style={[s('background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:26px;overflow:hidden;'), { width: '48.5%' }]}>
              <View style={[{ height: 120, position: 'relative', backgroundColor: g.tone, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={s('font-family:ui-monospace,Menlo,monospace;font-size:11px;color:rgba(23,48,59,0.4);padding:0 md;text-align:center')}>{g.ph}</Text>
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
      )}

      {vm.isGrid && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: GRID_GAP }}>
          {vm.galleryMedia.map((g, i) => (
            <Pressable
              key={i}
              onPress={g.open}
              style={{ width: CELL, height: CELL, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: g.tone }}
            >
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
      )}

      {vm.galleryEmpty && (
        <Text style={s('text-align:center;padding:56px 5xl;color:#B4C1CA;font-size:12.8px;line-height:1.7')}>아직 올린 추억이 없어요.{'\n'}첫 추억을 남겨보세요</Text>
      )}
    </View>
  )
}
