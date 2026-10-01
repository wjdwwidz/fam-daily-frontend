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

// 게시판 글 쓰기·고치기 — 화면을 꽉 채운다 (길게 쓰는 자리라서).
// 위에 닫기·올리기를 붙여 두고, 본문 칸이 남은 높이를 모두 쓴다.
export default function PostSheet() {
  const vm = useVm()
  const insets = useSafeAreaInsets()
  const edit = vm.postSheetIsEdit
  const preview = useLinkPreviews(vm.postDraft)
  const canSave = !vm.postSaving && !!vm.postDraft.trim()
  return (
    <View style={s('position:absolute;inset:0;background:#fff;z-index:45;animation:sfade .18s ease')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
        style={{ flex: 1 }}
      >
        {/* 제목줄 — 닫기 · 무엇을 쓰는 중인지 · 올리기 */}
        <View style={s('flex-direction:row;align-items:center;justify-content:space-between;gap:lg;padding:xl 5xl;border-bottom:1px solid #FFE1EC')}>
          <Pressable onPress={vm.closePostSheet} hitSlop={12} style={s('width:32px;height:32px;border-radius:10px;align-items:center;justify-content:center;cursor:pointer')}>
            <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="#8497A1" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 6 L18 18" />
              <Path d="M18 6 L6 18" />
            </Svg>
          </Pressable>
          <Text style={s('font-size:14px;font-weight:800;color:#17303B')}>{edit ? '글 수정' : '새 글'}</Text>
          <Pressable onPress={vm.savePost} disabled={!canSave} style={s(`height:34px;padding:0 xl;border-radius:12px;align-items:center;justify-content:center;cursor:pointer;background:${canSave ? '#FF5E8A' : '#F3C6D5'}`)}>
            <Text style={s('font-size:12.5px;font-weight:700;color:#fff')}>
              {vm.postSaving ? '올리는 중…' : edit ? '수정' : '올리기'}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s('padding:2xl 5xl 7xl;flex-grow:1')} keyboardShouldPersistTaps="handled">
          {/* 공지로 올리면 제목이 생긴다 (목록 맨 위에 제목으로 선다) */}
          <Pressable onPress={vm.togglePostNotice} hitSlop={6} style={s('flex-direction:row;align-items:center;gap:md;cursor:pointer')}>
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
              style={s('width:100%;margin-top:xl;border:none;outline:none;font-size:17px;font-weight:800;font-family:inherit;color:#17303B;padding:md 0')}
            />
          )}
          <TextInput
            multiline
            textAlignVertical="top"
            value={vm.postDraft}
            onChangeText={vm.onPostDraft}
            maxLength={2000}
            placeholder="가족에게 하고 싶은 말을 자유롭게 남겨보세요"
            placeholderTextColor="#9DB2BD"
            style={s('width:100%;flex:1;min-height:220px;margin-top:md;border:none;outline:none;background:transparent;font-size:14px;line-height:1.7;font-family:inherit;color:#17303B;resize:none')}
          />
          {(preview.links.length > 0 || preview.loading) && (
            <View style={s('gap:md;margin-top:xl')}>
              {preview.links.map((l) => <LinkCard key={l.url} link={l} compact />)}
              {preview.loading && <Text style={s('font-size:11px;color:#9DB2BD')}>링크를 읽는 중…</Text>}
            </View>
          )}
          {!!vm.postSheetError && (
            <Text style={s('font-size:12px;color:#E5484D;margin-top:xl;text-align:center')}>{vm.postSheetError}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
