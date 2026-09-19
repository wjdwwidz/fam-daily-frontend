# 우리끼리 · 가족앱 (React Native / Expo)

가족만의 단어·추억·감정을 담는 모바일 앱. 웹 프로토타입(`fam-daily-frontend`)의
`FamilyPhonePop` 컴포넌트를 **React Native + Expo**로 재작성한 네이티브 앱입니다.

> 배포(웹·앱·백엔드)와 네이티브/OTA 구분은 [DEPLOY.md](./DEPLOY.md) 참고.

## 실행

```bash
npm install
npx expo start          # QR 코드 → 폰의 Expo Go 앱으로 스캔
# 또는
npx expo start --ios     # iOS 시뮬레이터
npx expo start --android # Android 에뮬레이터
npx expo start --web     # 브라우저(react-native-web) 미리보기
```

폰에서 바로 보려면 App Store/Play스토어에서 **Expo Go**(무료)를 설치하고
`npx expo start` 후 나오는 QR을 스캔하세요.

### 웹 미리보기에서 특정 화면 열기
`http://localhost:8081/?screen=<name>&variant=<cards|grid>`
- screen: login · signup · space · createSpace · joinSpace · home · dict · word
  · gallery · media · qna · qnahistory · moodhistory · upload · members · profile

## 구조

```
App.js                  진입점 (SafeAreaView + StatusBar)
src/
  FamilyPhonePop.jsx     상태·뷰모델(vm)·라우팅 (웹 버전 로직 재사용)
  lib/style.js           CSS 문자열 → RN 스타일 변환기 s()
                         (px→number, box-shadow, border, transform,
                          display:flex/grid→flex, border-radius:50% 등 처리)
  components/
    Flower.jsx           react-native-svg 꽃 장식
    Gradient.jsx         expo-linear-gradient 브랜드 그라디언트
    Nav.jsx              하단 탭바(5) + FAB
  screens/               화면 16종 (View/Text/Pressable/TextInput)
  overlays/              바텀시트 5종
assets/img/              mascot · signature · onboarding
```

## 기술 메모

- 웹의 인라인 CSS 문자열을 최대한 재사용하기 위해 `s()` 변환기를 둠. RN과 웹의
  차이(그림자, flex 기본축, px 단위, CSS grid 미지원)를 흡수한다.
- 아이콘/장식은 `react-native-svg`, 그라디언트는 `expo-linear-gradient`.
- 원형 아바타는 `<View>` + 중앙정렬 `<Text>` 구조 (RN Text는 박스 사이징 불가).
- 폰트: 현재 시스템 폰트. Pretendard 번들링은 `expo-font`로 추가 예정.
- 사진/영상 자리는 플레이스홀더(줄무늬). 실제 업로드는 `expo-image-picker`로 연동 예정.
```
```

## 다음 단계 (네이티브 기능)

- expo-image-picker: 사진·영상 업로드
- expo-notifications: 가족 한마디/일정 푸시
- 카카오 로그인 SDK 연동
- Pretendard 폰트 번들 (expo-font)
