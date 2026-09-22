import { useEffect } from 'react'
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'
import Photo from '../components/Photo.jsx'
import VideoItem from '../components/VideoItem.jsx'

import { useVm } from '../vm/useVm.js'

// 댓글·답글 한 줄. 답글은 부모 아래에 들여써서 같은 모양으로 그린다.
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
            <Text style={s('font-size:11px;font-weight:700;color:#8497A1')}>답글</Text>
          </Pressable>
          {c.mine && (
            <>
              <Pressable onPress={c.edit} hitSlop={8}>
                <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A')}>수정</Text>
              </Pressable>
              <Pressable onPress={c.remove} hitSlop={8}>
                <Text style={s('font-size:11px;font-weight:700;color:#E5484D')}>삭제</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

export default function Media() {
  const vm = useVm()
  const m = vm.currentMedia
  // 글이 바뀔 때마다 그 글의 댓글을 불러온다 (early return 보다 먼저 — 훅 순서 고정)
  const mediaId = m?.id
  useEffect(() => { if (mediaId) vm.loadComments() }, [mediaId])
  if (!m) return null
  return (
    <View style={s('padding:0 0 120px')}>
      {/* zIndex 는 형제끼리만 비교된다. 헤더 줄 자체를 올려야 ⋯ 메뉴가 아래 사진 위로 뜬다. (Android 는 elevation 도 필요) */}
      <View style={[s('display:flex;align-items:center;justify-content:space-between;padding:sm 4xl 2xl'), { zIndex: 50, elevation: 50 }]}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('width:40px;height:40px')} />
        <View style={s('position:relative')}>
          {/* 삭제는 올린 본인만 (서버도 같은 규칙) */}
          {m.mine ? (
            <>
              <Pressable onPress={vm.toggleMenuMedia} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center')}>
                <Text style={s('color:#8497A1;font-size:17.4px')}>⋯</Text>
              </Pressable>
              {vm.isMenuMedia && (
                <View style={s('position:absolute;right:0;top:46px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;box-shadow:0 12px 30px rgba(255,94,138,0.22);overflow:hidden;z-index:20;min-width:128px')}>
                  <Pressable onPress={vm.editMedia} style={s('display:flex;align-items:center;gap:lg;padding:xl 3xl')}>
                    <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" /><Path d="M13 7 L17 11" /></Svg>
                    <Text style={s('font-size:13px;font-weight:600;color:#17303B')}>수정하기</Text>
                  </Pressable>
                  <View style={s('height:1px;background:#FFE1EC')} />
                  <Pressable onPress={vm.deleteMedia} style={s('display:flex;align-items:center;gap:lg;padding:xl 3xl')}>
                    <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#E5484D"><Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" /></Svg>
                    <Text style={s('font-size:13px;font-weight:600;color:#E5484D')}>삭제하기</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={s('width:40px;height:40px')} />
          )}
        </View>
      </View>

      <View style={s('display:flex;align-items:center;gap:xl;margin:0 5xl 3xl')}>
        <Avatar photoUrl={m.by.photoUrl} ini={m.by.ini} size={38} />
        <View style={s('flex:1')}>
          <Text style={s('font-size:11.7px;font-weight:700;color:#17303B')}>{m.by.name}님이 올림</Text>
          <Text style={s('font-size:11px;color:#9DB2BD')}>{`${m.date} ${m.time}`.trim()}</Text>
        </View>
      </View>

      {/* 언제의 일인지 — 올린 날과 다를 수 있다. 고르지 않은 글은 그리지 않는다 */}
      {!!m.takenLabel && (
        <View style={s('flex-direction:row;align-items:center;gap:md;margin:-10px 5xl 3xl;align-self:flex-start;background:#FFF0F5;border-radius:12px;padding:md lg')}>
          <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 6 h14 a1 1 0 0 1 1 1 v12 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 V7 a1 1 0 0 1 1 -1 Z" />
            <Path d="M4 10 H20 M8 4 V8 M16 4 V8" />
          </Svg>
          <Text style={s('font-size:11.5px;font-weight:700;color:#FF5E8A')}>{m.takenLabel}</Text>
        </View>
      )}

      {/* 장소 — 누르면 구글 지도 (폰에 앱이 있으면 앱으로) */}
      {m.place && (
        <Pressable onPress={m.openPlace} style={s('flex-direction:row;align-items:center;gap:md;margin:-10px 5xl 3xl;align-self:flex-start;background:#FFF0F5;border-radius:12px;padding:md lg;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 21 C12 21 5 14.5 5 9.5 A7 7 0 0 1 19 9.5 C19 14.5 12 21 12 21 Z" />
            <Path d="M12 12 A2.5 2.5 0 1 0 12 7 A2.5 2.5 0 1 0 12 12 Z" />
          </Svg>
          <Text numberOfLines={1} style={s('flex-shrink:1;font-size:11.5px;font-weight:700;color:#FF5E8A')}>{m.place.name}</Text>
          <Text style={s('font-size:11px;color:#FF9FBC')}>›</Text>
        </Pressable>
      )}

      <View style={s('margin:0 5xl;gap:lg')}>
        {m.items.map((it, i) =>
          it.type === 'video'
            ? <VideoItem key={i} uri={it.url} radius={28} />
            : <Photo key={i} uri={it.url} radius={28} />
        )}
      </View>

      {!!m.title && (
        <View style={s('padding:4xl screenX 0')}>
          <Text style={s('font-size:14px;color:#2B3A43;line-height:1.6;white-space:pre-wrap')}>{m.title}</Text>
        </View>
      )}

      {/* 댓글 */}
      <View style={s('margin:6xl 5xl 0;gap:lg')}>
        <View style={s('flex-direction:row;align-items:center;gap:md;padding-top:3xl;border-top:1px solid #F0DEE6')}>
          <Text style={s('font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px')}>댓글</Text>
          {vm.commentCount > 0 && <Text style={s('font-size:12px;font-weight:700;color:#8497A1')}>{vm.commentCount}</Text>}
          {vm.commentsLoading && <ActivityIndicator size="small" color="#FF5E8A" />}
        </View>

        {!vm.commentsLoading && vm.mediaComments.length === 0 && (
          <Text style={s('font-size:12.5px;color:#9DB2BD;padding:md 0')}>아직 댓글이 없어요. 첫 댓글을 남겨보세요</Text>
        )}

        {vm.mediaComments.map((c) => (
          <View key={c.id} style={s('gap:md')}>
            <CommentRow c={c} />
            {c.replies.map((r) => (
              <View key={r.id} style={s('padding-left:5xl')}>
                <CommentRow c={r} />
              </View>
            ))}
          </View>
        ))}

        {/* 답글·수정 중이면 무엇을 하고 있는지 알려주고 취소할 수 있게 */}
        {(vm.commentReplyTo || vm.commentEditing) && (
          <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin-top:md;background:#FFF0F5;border-radius:10px;padding:md xl')}>
            <Text style={s('font-size:11.5px;font-weight:700;color:#FF5E8A')}>
              {vm.commentEditing ? '댓글 수정 중' : `${vm.commentReplyTo.name}님에게 답글`}
            </Text>
            <Pressable onPress={vm.cancelCommentMode} hitSlop={8}>
              <Text style={s('font-size:11.5px;font-weight:700;color:#8497A1')}>취소</Text>
            </Pressable>
          </View>
        )}

        <View style={s('flex-direction:row;align-items:flex-end;gap:lg;margin-top:md')}>
          <Avatar photoUrl={vm.myPhoto} ini={vm.myInitial} size={32} />
          <TextInput
            value={vm.commentDraft}
            onChangeText={vm.onCommentDraft}
            placeholder={vm.commentReplyTo ? `${vm.commentReplyTo.name}님에게 답글 남기기` : '댓글을 남겨보세요'}
            placeholderTextColor="#9DB2BD"
            multiline
            maxLength={300}
            style={s('flex:1;min-width:0;min-height:40px;max-height:120px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;padding:md xl;font-size:13px;color:#17303B;font-family:inherit;outline:none')}
          />
          <Pressable
            onPress={vm.submitComment}
            disabled={vm.commentSaving || !vm.commentDraft.trim()}
            style={s(`height:40px;padding:0 xl;border-radius:12px;align-items:center;justify-content:center;background:${vm.commentDraft.trim() ? '#FF5E8A' : '#F3C6D5'};opacity:${vm.commentSaving ? 0.7 : 1}`)}
          >
            <Text style={s('font-size:12.5px;font-weight:700;color:#fff')}>{vm.commentSaving ? '…' : vm.commentEditing ? '수정' : '등록'}</Text>
          </Pressable>
        </View>
        {vm.commentError && <Text style={s('font-size:11.5px;color:#E5484D')}>{vm.commentError}</Text>}
      </View>
    </View>
  )
}
