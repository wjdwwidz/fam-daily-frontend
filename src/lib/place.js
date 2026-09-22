// 장소를 구글 지도에서 여는 주소.
// placeId 가 있으면 그 가게를 정확히 연다 (이름만으로는 같은 이름의 다른 곳이 뜰 수 있다).
// 폰에 구글 지도 앱이 있으면 앱으로, 없으면 웹 지도로 열린다.
export function placeMapUrl(place) {
  if (!place) return null
  const base = 'https://www.google.com/maps/search/?api=1'
  if (place.placeId) {
    return `${base}&query=${encodeURIComponent(place.name || '')}&query_place_id=${encodeURIComponent(place.placeId)}`
  }
  if (place.lat != null && place.lng != null) return `${base}&query=${place.lat},${place.lng}`
  return `${base}&query=${encodeURIComponent(place.name || '')}`
}
