import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'
import LinkCard from '../components/LinkCard.jsx'
import { splitByLinks } from '../lib/links.js'

import { useVm } from '../vm/useVm.js'

// 댓글·답글 한 줄 (일상 글의 댓글과 같은 모양)
function CommentRow({ c }) {
  if (c.deleted) {
    return (
      <View style={s('background:#FCEEF4;border-radius:14px;padding:lg xl')}>
        <Text style={s('font-size:12px;color:#9DB2BD')}>삭제된 댓글이에요</Text>
      </View>
    )
  }
  return (
    <View style={s('flex-direction:row;align-items:flex-start;gap:lg')}>
      <Avatar photoUrl={c.by.photoUrl} ini={c.by.ini} size={30} />
      <View style={s('flex:1;min-width:0;background:#FCEEF4;border-radius:14px;padding:lg xl')}>
        <View style={s('flex-direction:row;align-items:center;gap:md;flex-wrap:wrap')}>
          <Text style={s('font-size:12px;font-weight:700;color:#17303B')}>{c.by.name}</Text>
          <Text style={s('font-size:10.5px;color:#B4C1CA')}>{c.time}{c.edited ? ' · 수정됨' : ''}</Text>
        </View>
        <Text style={s('font-size:13px;color:#3F4E58;line-height:1.55;margin-top:xs')}>{c.text}</Text>
        <View style={s('flex-direction:row;align-items:center;gap:2xl;margin-top:md')}>
          <Pressable onPress={c.reply} hitSlop={8}>
            <Text style={s('font-size:11.5px;font-weight:700;color:#8497A1')}>답글</Text>
          </Pressable>
          {c.mine && (
            <>
              <Pressable onPress={c.edit} hitSlop={8}>
                <Text style={s('font-size:11.5px;font-weight:700;color:#8497A1')}>수정</Text>
              </Pressable>
              <Pressable onPress={c.remove} hitSlop={8}>
                <Text style={s('font-size:11.5px;font-weight:700;color:#E5848D')}>삭제</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

// 게시판 글 하나 — 글 내용과 댓글.
export default function PostDetail() {
  const vm = useVm()
  const p = vm.currentPost

  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin:sm 0 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        {/* 내가 쓴 글만 고치고 지운다 */}
        {!!p?.mine && (
          <View style={s('flex-direction:row;align-items:center;gap:2xl')}>
            <Pressable onPress={p.edit} hitSlop={8}>
              <Text style={s('font-size:12.5px;font-weight:700;color:#8497A1')}>수정</Text>
            </Pressable>
            <Pressable onPress={p.remove} hitSlop={8}>
              <Text style={s('font-size:12.5px;font-weight:700;color:#E5848D')}>삭제</Text>
            </Pressable>
          </View>
        )}
      </View>

      {vm.postLoading && !p && (
        <View style={s('align-items:center;padding:8xl 0')}><ActivityIndicator color="#FF5E8A" /></View>
      )}
      {!!vm.postError && (
        <Text style={s('font-size:12.5px;color:#E5484D;text-align:center;padding:5xl 0')}>{vm.postError}</Text>
      )}

      {!!p && (
        <>
          <View style={s('flex-direction:row;align-items:center;gap:md')}>
            <Avatar photoUrl={p.by.photoUrl} ini={p.by.ini} size={34} />
            <View>
              <Text style={s('font-size:12.5px;font-weight:700;color:#17303B')}>{p.by.name}</Text>
              <Text style={s('font-size:11px;color:#9DB2BD')}>{p.time}{p.edited ? ' · 수정됨' : ''}</Text>
            </View>
          </View>
          {/* 블로그처럼 — 본문에서 링크가 있던 자리에 카드를 끼운다 */}
          <View style={s('gap:lg;margin-top:2xl')}>
            {splitByLinks(p.text, p.links).map((part, i) =>
              part.type === 'link'
                ? <LinkCard key={i} link={part.link} />
                : <Text key={i} style={s('font-size:14px;color:#2B3A43;line-height:1.7;white-space:pre-wrap')}>{part.text}</Text>,
            )}
          </View>

          <View style={s('height:1px;background:#FFE1EC;margin:4xl 0 3xl')} />

          <Text style={s('font-size:12.5px;font-weight:700;color:#17303B;margin-bottom:xl')}>댓글 {vm.postCommentCount}</Text>

          {vm.postComments.length === 0 && (
            <Text style={s('font-size:12.5px;color:#9DB2BD;padding:md 0')}>아직 댓글이 없어요. 첫 댓글을 남겨보세요</Text>
          )}

          <View style={s('gap:xl')}>
            {vm.postComments.map((c) => (
              <View key={c.id} style={s('gap:md')}>
                <CommentRow c={c} />
                {c.replies.map((r) => (
                  <View key={r.id} style={s('padding-left:5xl')}>
                    <CommentRow c={r} />
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* 답글·수정 중이면 무엇을 하고 있는지 알려주고 취소할 수 있게 */}
          {(vm.postReplyTo || vm.postCommentEditing) && (
            <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin-top:xl;background:#FFF0F5;border-radius:10px;padding:md xl')}>
              <Text style={s('font-size:11.5px;font-weight:700;color:#FF5E8A')}>
                {vm.postCommentEditing ? '댓글 수정 중' : `${vm.postReplyTo.name}님에게 답글`}
              </Text>
              <Pressable onPress={vm.cancelPostCommentMode} hitSlop={8}>
                <Text style={s('font-size:11.5px;font-weight:700;color:#8497A1')}>취소</Text>
              </Pressable>
            </View>
          )}

          <View style={s('flex-direction:row;align-items:flex-end;gap:lg;margin-top:xl')}>
            <Avatar photoUrl={vm.myPhoto} ini={vm.myInitial} size={32} />
            <TextInput
              value={vm.postCommentDraft}
              onChangeText={vm.onPostCommentDraft}
              placeholder={vm.postReplyTo ? `${vm.postReplyTo.name}님에게 답글 남기기` : '댓글을 남겨보세요'}
              placeholderTextColor="#9DB2BD"
              multiline
              maxLength={300}
              style={s('flex:1;min-width:0;min-height:40px;max-height:120px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;padding:md xl;font-size:13px;color:#17303B;font-family:inherit;outline:none')}
            />
            <Pressable
              onPress={vm.submitPostComment}
              disabled={vm.postCommentSaving || !vm.postCommentDraft.trim()}
              style={s(`height:40px;padding:0 xl;border-radius:12px;align-items:center;justify-content:center;background:${vm.postCommentDraft.trim() ? '#FF5E8A' : '#F3C6D5'};opacity:${vm.postCommentSaving ? 0.7 : 1}`)}
            >
              <Text style={s('font-size:12.5px;font-weight:700;color:#fff')}>{vm.postCommentSaving ? '…' : vm.postCommentEditing ? '수정' : '등록'}</Text>
            </Pressable>
          </View>
          {!!vm.postCommentError && <Text style={s('font-size:11.5px;color:#E5484D;margin-top:xs')}>{vm.postCommentError}</Text>}
        </>
      )}
    </View>
  )
}
