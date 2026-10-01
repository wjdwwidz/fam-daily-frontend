import * as WebBrowser from 'expo-web-browser'

// 게시판 글의 링크 → 블로그처럼 본문 사이에 카드로.
//
// 링크 찾는 규칙은 서버(fam-daily-backend src/links/link-preview.service.ts 의 extractUrls)와 같다.
// 서버가 찾은 링크마다 카드 정보(post.links)를 붙여 주고, 화면은 본문에서 그 주소가 있던 자리에 카드를 끼운다.
const URL_RE = /https?:\/\/[^\s<>"'`]+/gi
const TRAILING_RE = /[.,!?;:)\]}>'"…。、]+$/
export const MAX_LINKS = 10

export function findUrls(text) {
  const urls = []
  for (const raw of String(text || '').match(URL_RE) || []) {
    const url = raw.replace(TRAILING_RE, '')
    if (!urls.includes(url)) urls.push(url)
    if (urls.length >= MAX_LINKS) break
  }
  return urls
}

// 본문을 [글, 카드, 글, …] 조각으로 나눈다. 카드 정보가 없는 주소는 글로 남긴다.
// 카드 앞뒤의 빈 줄은 걷어서, 링크만 한 줄에 둔 글이 카드 위아래로 빈칸을 남기지 않게 한다.
export function splitByLinks(text, links = []) {
  const byUrl = new Map(links.map((l) => [l.url, l]))
  const parts = []
  const src = String(text || '')
  let last = 0
  for (const m of src.matchAll(URL_RE)) {
    const url = m[0].replace(TRAILING_RE, '')
    const link = byUrl.get(url)
    if (!link) continue
    // "(링크)." 처럼 주소를 감싼 괄호·문장부호는 카드와 함께 걷는다 — 카드 앞뒤에 "(" 나 ")." 만 남지 않게
    parts.push({ type: 'text', text: src.slice(last, m.index).replace(/[([{<「"'][ \t]*$/, '') })
    parts.push({ type: 'link', link })
    last = m.index + url.length
    last += /^[)\]}>」"'.,!?;:…]*/.exec(src.slice(last))[0].length
  }
  parts.push({ type: 'text', text: src.slice(last) })
  return parts
    .map((p) => (p.type === 'text' ? { ...p, text: p.text.replace(/^[ \t]*\n|\n[ \t]*$/g, '') } : p))
    .filter((p) => p.type === 'link' || p.text.trim() !== '')
}

// 목록용: 카드로 보여줄 주소는 본문에서 빼고 남은 글만
export function textWithoutLinks(text, links = []) {
  return splitByLinks(text, links)
    .filter((p) => p.type === 'text')
    .map((p) => p.text.trim())
    .join('\n')
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export const openLink = (url) => WebBrowser.openBrowserAsync(url).catch(() => {})
