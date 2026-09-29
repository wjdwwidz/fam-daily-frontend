import { useEffect, useState } from 'react'
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s } from '../lib/style.js'
import { findUrls } from '../lib/links.js'
import { boardApi } from '../lib/api/board.js'
import LinkCard from '../components/LinkCard.jsx'

import { useVm } from '../vm/useVm.js'

// 글을 쓰는 동안 본문의 링크를 카드로 미리 보여준다.
// 타자를 칠 때마다 부르지 않도록 잠깐 멈췄을 때 읽고, 한 번 읽은 주소는 기억해 둔다.
// 보여주기용이다 — 저장할 때 서버가 같은 방법으로 다시 읽어 글에 붙인다.
const previewCache = new Map()

function useLinkPreviews(text) {
  const [, setTick] = useState(0)
  const urls = findUrls(text)
  const key = urls.join(' ')
  useEffect(() => {
    const todo = urls.filter((u) => !previewCache.has(u))
    if (!todo.length) return
    let alive = true
    const t = setTimeout(() => {
      for (const u of todo) {
        previewCache.set(u, null) // 읽는 중
        boardApi.linkPreview(u)
          .then((l) => previewCache.set(u, l))
          .catch(() => previewCache.delete(u))
          .finally(() => { if (alive) setTick((n) => n + 1) })
      }
      if (alive) setTick((n) => n + 1)
    }, 700)
    return () => { alive = false; clearTimeout(t) }
  }, [key])
  return {
    links: urls.map((u) => previewCache.get(u)).filter(Boolean),
    loading: urls.some((u) => previewCache.get(u) === null),
  }
}

// 게시판 글 쓰기·고치기
export default function PostSheet() {
  const vm = useVm()
  const insets = useSafeAreaInsets()
  const edit = vm.postSheetIsEdit
  const preview = useLinkPreviews(vm.postDraft)
  return (
    <Pressable onPress={vm.closePostSheet} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;flex-direction:row;align-items:flex-end;animation:sfade .18s ease')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
        style={{ width: '100%' }}
      >
        <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
          <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')} />
          <View style={s('flex-direction:row;align-items:center;justify-content:space-between')}>
            <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A;letter-spacing:0.4px')}>{edit ? '글 수정' : '새 글'}</Text>
            <Pressable onPress={vm.closePostSheet} hitSlop={12} style={s('width:28px;height:28px;border-radius:9px;align-items:center;justify-content:center')}>
              <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#B7C3CC" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M6 6 L18 18" />
                <Path d="M18 6 L6 18" />
              </Svg>
            </Pressable>
          </View>
          <Text style={s('font-size:16px;font-weight:800;color:#17303B;margin-top:sm;line-height:1.4')}>
            {edit ? '어떻게 고칠까요?' : '가족에게 하고 싶은 말은?'}
          </Text>
          {/* 공지로 올리면 제목이 생긴다 (목록 맨 위에 제목으로 선다) */}
          <Pressable onPress={vm.togglePostNotice} hitSlop={6} style={s('flex-direction:row;align-items:center;gap:md;margin-top:xl;cursor:pointer')}>
            <View style={s(`width:20px;height:20px;border-radius:6px;align-items:center;justify-content:center;border:1.5px solid ${vm.postIsNotice ? '#FF5E8A' : '#E7D3DC'};background:${vm.postIsNotice ? '#FF5E8A' : 'transparent'}`)}>
              {vm.postIsNotice && (
                <Svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 13 L10 18 L19 7" /></Svg>
              )}
            </View>
            <Text style={s('font-size:12px;font-weight:600;color:#8497A1')}>공지로 올리기</Text>
          </Pressable>
          {vm.postIsNotice && (
            <TextInput
              value={vm.postTitleDraft}
              onChangeText={vm.onPostTitle}
              maxLength={60}
              placeholder="공지 제목"
              placeholderTextColor="#9DB2BD"
              style={s('width:100%;margin-top:md;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:xl 3xl;font-size:13.5px;font-weight:700;font-family:inherit;color:#17303B')}
            />
          )}
          <TextInput
            multiline
            textAlignVertical="top"
            value={vm.postDraft}
            onChangeText={vm.onPostDraft}
            maxLength={2000}
            placeholder="자유롭게 남겨보세요"
            placeholderTextColor="#9DB2BD"
            style={s('width:100%;min-height:140px;max-height:280px;margin-top:fieldGap;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.5px;font-family:inherit;color:#17303B;resize:none')}
          />
          {(preview.links.length > 0 || preview.loading) && (
            <ScrollView style={{ maxHeight: 180, marginTop: 10 }} contentContainerStyle={s('gap:md')}>
              {preview.links.map((l) => <LinkCard key={l.url} link={l} compact />)}
              {preview.loading && <Text style={s('font-size:11px;color:#9DB2BD')}>링크를 읽는 중…</Text>}
            </ScrollView>
          )}
          {!!vm.postSheetError && (
            <Text style={s('font-size:12px;color:#E5484D;margin-top:md;text-align:center')}>{vm.postSheetError}</Text>
          )}
          <Pressable onPress={vm.savePost} disabled={vm.postSaving} style={s(`margin-top:ctaTop;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;cursor:pointer;opacity:${vm.postSaving ? 0.7 : 1}`)}>
            <Text style={s('font-size:14px;font-weight:700;color:#fff')}>
              {vm.postSaving ? '올리는 중…' : edit ? '수정하기' : '올리기'}
            </Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  )
}
