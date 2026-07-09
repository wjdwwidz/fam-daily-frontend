import { View, Text, Pressable, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function Gallery({ vm }) {
  return (
    <View style={s('padding:8px 20px 110px')}>
      <View style={s('flex-direction:row;align-items:baseline;justify-content:space-between;margin:6px 2px 4px')}>
        <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>기록</Text>
        <Text style={s('font-size:11.3px;color:#9DB2BD')}>168개</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s('gap:7px;padding:8px 2px 12px')}>
        {vm.galleryTabs.map((t, i) => (
          <Pressable key={i} onPress={t.pick} style={s(`flex:0 0 auto;padding:8px 15px;border-radius:999px;border:1px solid ${t.border};background:${t.bg}`)}>
            <Text style={s(`font-size:12.3px;font-weight:700;color:${t.color}`)}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {vm.isCards && (
        <View style={s('flex-direction:row;flex-wrap:wrap;justify-content:space-between;row-gap:12px')}>
          {vm.galleryMedia.map((g, i) => (
            <Pressable key={i} onPress={g.open} style={[s('background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:26px;overflow:hidden;'), { width: '48.5%' }]}>
              <View style={s(`height:120px;position:relative;background-color:${g.tone};background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.35) 0 9px,transparent 9px 18px);display:flex;align-items:center;justify-content:center`)}>
                <Text style={s('font-family:ui-monospace,Menlo,monospace;font-size:11px;color:rgba(23,48,59,0.4);padding:0 8px;text-align:center')}>{g.ph}</Text>
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
        <View style={s('flex-direction:row;flex-wrap:wrap;justify-content:space-between;row-gap:6px')}>
          {vm.galleryMedia.map((g, i) => (
            <Pressable key={i} onPress={g.open} style={[s(`aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;background-color:${g.tone};background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.35) 0 8px,transparent 8px 16px)`), { width: '32%' }]}>
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
        <Text style={s('text-align:center;padding:56px 20px;color:#B4C1CA;font-size:12.8px;line-height:1.7')}>아직 올린 기록이 없어요.{'\n'}첫 추억을 남겨보세요 🌱</Text>
      )}
    </View>
  )
}
