// 웹 CSS 문자열 → React Native 스타일 객체 변환기.
// 웹 프로토타입의 인라인 스타일을 최대한 그대로 재사용하기 위한 헬퍼.
// RN과 웹의 의미 차이(그림자, flex 기본축, px 단위, 그라디언트 등)를 흡수한다.

import { resolveFontSize } from './type.js'
import { resolveSpace } from './space.js'

// 전역 폰트 크기 보정(px). 디자인 대비 살짝 키움.
const FONT_BUMP = 1

const DROP = new Set([
  'cursor', 'transition', 'animation', 'filter', 'backdropFilter', 'webkitBackdropFilter',
  'whiteSpace', 'textOverflow', 'boxSizing', 'outline', 'userSelect', 'pointerEvents',
  'webkitTapHighlightColor', 'webkitOverflowScrolling', 'objectFit', 'resize', 'scrollbarWidth',
  'backgroundImage', 'webkitBackgroundClip', 'backgroundClip', 'webkitTextFillColor',
])

const px = (v) => {
  if (typeof v !== 'string') return v
  const t = v.trim()
  if (/^-?\d*\.?\d+px$/.test(t)) return parseFloat(t)
  if (/^-?\d*\.?\d+$/.test(t)) return parseFloat(t)
  return t
}

const camel = (k) => k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())

function parseShadow(val, out) {
  // e.g. "0 10px 24px rgba(255,94,138,0.13)" (offsetX offsetY blur color)
  const m = val.match(/(-?\d*\.?\d+)px?\s+(-?\d*\.?\d+)px?\s+(-?\d*\.?\d+)px?\s+(rgba?\([^)]*\)|#[0-9a-f]+)/i)
  if (!m) return
  const [, ox, oy, blur, color] = m
  out.shadowColor = color
  out.shadowOffset = { width: parseFloat(ox), height: parseFloat(oy) }
  out.shadowRadius = parseFloat(blur) / 1.5
  let opacity = 1
  const rgba = color.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
  if (rgba) opacity = parseFloat(rgba[1])
  out.shadowOpacity = opacity ? 1 : 0.15
  // color가 rgba면 opacity가 이미 담겨있으니 shadowOpacity는 1로
  out.shadowOpacity = 1
  out.elevation = Math.max(1, Math.round(parseFloat(blur) / 3))
}

function parseBorder(val, out, prefix) {
  // "1px solid #FFE1EC" | "1.5px dashed #C7E7F7"
  const parts = val.trim().split(/\s+/)
  let width, style, color
  for (const p of parts) {
    if (/^-?\d*\.?\d+px$/.test(p) || /^-?\d*\.?\d+$/.test(p)) width = parseFloat(p)
    else if (/^(solid|dashed|dotted|none)$/.test(p)) style = p
    else color = p
  }
  if (prefix === 'Left' || prefix === 'Right' || prefix === 'Top' || prefix === 'Bottom') {
    if (width != null) out['border' + prefix + 'Width'] = width
    if (color) out['border' + prefix + 'Color'] = color
    // RN은 방향별 borderStyle 미지원 → 전체 style로
    if (style) out.borderStyle = style
  } else {
    if (width != null) out.borderWidth = width
    if (color) out.borderColor = color
    if (style) out.borderStyle = style
  }
}

// margin/padding 축약형(1~4값) → RN 개별 속성. 'auto'는 margin 중앙정렬용으로 유지.
function expandBox(val, out, prop) {
  const parts = val.trim().split(/\s+/).map((v) => (v === 'auto' ? 'auto' : (resolveSpace(v) ?? px(v))))
  let t, r, b, l
  if (parts.length === 1) { t = r = b = l = parts[0] }
  else if (parts.length === 2) { t = b = parts[0]; r = l = parts[1] }
  else if (parts.length === 3) { t = parts[0]; r = l = parts[1]; b = parts[2] }
  else { t = parts[0]; r = parts[1]; b = parts[2]; l = parts[3] }
  out[prop + 'Top'] = t
  out[prop + 'Right'] = r
  out[prop + 'Bottom'] = b
  out[prop + 'Left'] = l
}

function parseTransform(val) {
  const arr = []
  const re = /(\w+)\(([^)]+)\)/g
  let m
  while ((m = re.exec(val))) {
    const fn = m[1]
    const args = m[2].split(',').map((a) => a.trim())
    if (fn === 'translate') {
      arr.push({ translateX: px(args[0]) })
      if (args[1] != null) arr.push({ translateY: px(args[1]) })
    } else if (fn === 'rotate' || fn === 'rotateZ') {
      arr.push({ rotate: args[0] })
    } else if (fn === 'scale') {
      arr.push({ scale: parseFloat(args[0]) })
    } else if (fn === 'translateX' || fn === 'translateY' || fn === 'scaleX' || fn === 'scaleY') {
      arr.push({ [fn]: fn.startsWith('scale') ? parseFloat(args[0]) : px(args[0]) })
    }
  }
  return arr
}

export function s(str) {
  if (!str) return {}
  const raw = {}
  let flexDirSet = false
  let displayFlex = false
  let pendingLineHeight = null

  for (const decl of String(str).split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const key = camel(decl.slice(0, i))
    let val = decl.slice(i + 1).trim()
    if (!key || val === '') continue

    switch (key) {
      case 'display':
        if (val === 'flex') displayFlex = true
        else if (val === 'grid') { raw.flexDirection = 'row'; raw.flexWrap = 'wrap'; flexDirSet = true }
        continue
      case 'gridTemplateColumns':
      case 'gridTemplateRows':
      case 'gridAutoRows':
      case 'gridAutoColumns':
      case 'gridColumn':
      case 'gridRow':
        continue
      case 'flexDirection':
        flexDirSet = true
        raw.flexDirection = val
        continue
      case 'flex': {
        const parts = val.split(/\s+/)
        if (parts.length === 1) raw.flex = px(parts[0])
        else {
          raw.flexGrow = px(parts[0])
          if (parts[1] != null) raw.flexShrink = px(parts[1])
          if (parts[2] != null) raw.flexBasis = /^-?\d/.test(parts[2]) ? px(parts[2]) : parts[2]
        }
        continue
      }
      case 'background':
        if (/gradient/i.test(val)) continue
        raw.backgroundColor = val
        continue
      case 'boxShadow':
        if (val !== 'none') parseShadow(val, raw)
        continue
      case 'border':
        if (val === 'none') { raw.borderWidth = 0; continue }
        parseBorder(val, raw, '')
        continue
      case 'borderLeft': parseBorder(val, raw, 'Left'); continue
      case 'borderRight': parseBorder(val, raw, 'Right'); continue
      case 'borderTop': parseBorder(val, raw, 'Top'); continue
      case 'borderBottom': parseBorder(val, raw, 'Bottom'); continue
      case 'inset':
        raw.top = px(val); raw.bottom = px(val); raw.left = px(val); raw.right = px(val)
        continue
      case 'overflowX':
      case 'overflowY':
        raw.overflow = val === 'auto' || val === 'scroll' ? 'scroll' : val
        continue
      case 'zIndex':
        raw.zIndex = px(val); continue
      case 'transform':
        raw.transform = parseTransform(val); continue
      case 'lineHeight':
        if (/^-?\d*\.?\d+$/.test(val)) { pendingLineHeight = parseFloat(val) } // 단위없음 → 나중에 fontSize와 계산
        else raw.lineHeight = px(val)
        continue
      case 'fontSize': {
        // 토큰(sm/base/xl…) 우선, 없으면 기존 px 값 그대로
        const token = resolveFontSize(val)
        raw.fontSize = (token != null ? token : px(val)) + FONT_BUMP
        continue
      }
      case 'margin': expandBox(val, raw, 'margin'); continue
      case 'padding': expandBox(val, raw, 'padding'); continue
      case 'gap': raw.gap = resolveSpace(val) ?? px(val); continue
      case 'borderRadius': {
        const parts = val.trim().split(/\s+/)
        if (val.includes('%')) { raw.borderRadius = 9999 }
        else if (parts.length === 1) { raw.borderRadius = px(val) }
        else {
          // TL TR BR BL
          const [tl, tr, br, bl] = [parts[0], parts[1], parts[2] ?? parts[0], parts[3] ?? parts[1]]
          raw.borderTopLeftRadius = px(tl); raw.borderTopRightRadius = px(tr)
          raw.borderBottomRightRadius = px(br); raw.borderBottomLeftRadius = px(bl)
        }
        continue
      }
      case 'aspectRatio': raw.aspectRatio = /\//.test(val) ? val.split('/').reduce((a, b) => parseFloat(a) / parseFloat(b)) : parseFloat(val); continue
      case 'fontWeight': raw.fontWeight = String(px(val)); continue
      default:
        if (DROP.has(key)) continue
        // 방향 지정 마진/패딩(marginTop, marginBottom, paddingLeft…)도 토큰 해석
        if (/^(margin|padding)(Top|Right|Bottom|Left)$/.test(key)) {
          raw[key] = resolveSpace(val) ?? px(val)
        } else {
          raw[key] = px(val)
        }
    }
  }

  if (displayFlex && !flexDirSet) raw.flexDirection = 'row'
  if (pendingLineHeight != null) {
    if (raw.fontSize) raw.lineHeight = Math.round(raw.fontSize * pendingLineHeight)
    // fontSize 없으면 lineHeight 생략 (RN 기본값 사용)
  }
  return raw
}
