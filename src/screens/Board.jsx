import { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'
import LinkCard from '../components/LinkCard.jsx'
import { textWithoutLinks } from '../lib/links.js'

import { useVm } from '../vm/useVm.js'

// 가족 게시판 — 기록 탭의 서브탭. 제목줄은 Record 가 소유하므로 여기선 본문만 그린다.
export default function Board() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadPosts() }, [groupId])

  const posts = vm.boardPosts
  return (
    <View>
      {!vm.boardLoading && posts.length === 0 && (
        <View style={s('align-items:center;padding:8xl 0')}>
          <Text style={s('font-size:13px;color:#9DB2BD')}>아직 올라온 글이 없어요</Text>
          <Text style={s('font-size:11.5px;color:#C4CFD6;margin-top:sm')}>가족에게 하고 싶은 말을 남겨보세요</Text>
        </View>
      )}

      <View style={s('gap:lg;padding-bottom:6xl')}>
        {posts.map((p) => {
          // 목록에서는 카드가 된 주소를 본문에서 빼고, 첫 카드만 작게 보여준다
          const body = textWithoutLinks(p.text, p.links)
          return (
            <Pressable key={p.id} onPress={p.open} style={s('background:#fff;border:1px solid #FFE1EC;border-radius:18px;padding:2xl;cursor:pointer')}>
              <View style={s('flex-direction:row;align-items:center;gap:md')}>
                <Avatar photoUrl={p.by.photoUrl} ini={p.by.ini} size={28} />
                <Text style={s('font-size:12px;font-weight:700;color:#17303B')}>{p.by.name}</Text>
                <Text style={s('font-size:10.5px;color:#B4C1CA')}>{p.time}{p.edited ? ' · 수정됨' : ''}</Text>
              </View>
              {/* 목록에서는 네 줄까지만 — 길게 쓴 글은 눌러서 본다 */}
              {!!body && <Text numberOfLines={4} style={s('font-size:13px;color:#3F4E58;line-height:1.55;margin-top:md')}>{body}</Text>}
              {p.links.length > 0 && (
                <View style={s('margin-top:md')}>
                  <LinkCard link={p.links[0]} compact />
                  {p.links.length > 1 && (
                    <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:xs')}>링크 {p.links.length - 1}개 더</Text>
                  )}
                </View>
              )}
              {p.commentCount > 0 && (
                <Text style={s('font-size:11px;color:#FF8FAE;font-weight:700;margin-top:md')}>댓글 {p.commentCount}</Text>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
