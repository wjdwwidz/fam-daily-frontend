import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from './Avatar.jsx'

// 최근 활동 한 줄 — 홈(5개)과 '더보기' 화면(전체)이 같은 모양을 쓴다.
// 문구: "{이름}님이 {prefix}{highlight}{suffix}"
export default function ActivityRow({ a, last }) {
  return (
    <Pressable
      onPress={a.open}
      style={s(`display:flex;align-items:center;gap:xl;padding:lg 0${last ? '' : ';border-bottom:1px solid rgba(239,244,247,0.7)'};cursor:pointer`)}
    >
      {/* 버킷리스트 달성처럼 '가족이 함께 이룬 일'은 사람 대신 체크 배지를 둔다 */}
      {a.by ? (
        <Avatar photoUrl={a.by.photoUrl} ini={a.by.ini} size={30} />
      ) : (
        <View style={s('width:30px;height:30px;border-radius:50%;background:#FF5E8A;align-items:center;justify-content:center;flex:0 0 auto')}>
          <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 13 L10 18 L19 7" /></Svg>
        </View>
      )}
      <Text numberOfLines={1} style={s('flex:1;font-size:11.5px;color:#57646E')}>
        {a.by && <><Text style={s('color:#17303B;font-weight:700')}>{a.by.name}</Text>님이 </>}
        {a.prefix}<Text style={s('color:#FF5E8A;font-weight:700')}>{a.highlight}</Text>{a.suffix}
      </Text>
      <Text style={s('font-size:10px;color:#B4C1CA')}>{a.date}</Text>
    </Pressable>
  )
}
