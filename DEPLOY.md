# 배포 안내

이 앱은 **웹**과 **안드로이드 앱**으로 나가고, 백엔드는 따로 배포한다.
바꾼 내용에 따라 나가는 길이 다르다 — 특히 **네이티브가 바뀌었는지**가 갈림길이다.

## 한눈에

| 바꾼 것 | 나가는 길 | 걸리는 시간 |
|---|---|---|
| 서버 코드 | `main` 푸시 → Railway 자동 배포 | 1~2분 |
| 웹 화면 | `main` 머지 → Vercel 자동 배포 | 2~3분 |
| 앱 화면·로직 (JS) | `eas update` | 수십 초 |
| **앱 네이티브** | `eas build` → 새 APK 배포 | **40분+ (대기열)** |

앞의 셋은 빠르고, **APK 빌드만 대기열이 있다.** 안드로이드를 컴파일하려면
Gradle·SDK가 깔린 전용 머신을 빌려야 하고, 무료 플랜은 순서를 기다린다.

## 무엇이 "네이티브 변경"인가

새 APK를 만들어 **가족들이 다시 설치**해야 하는 경우다.

1. **네이티브 코드를 품은 라이브러리** 추가·제거·버전업
   - 예: `@react-native-seoul/kakao-login`, `expo-updates`, `expo-camera`,
     `react-native-gesture-handler`, `react-native-reanimated`
   - JS만 있는 라이브러리는 해당 없음
2. **`app.json`의 네이티브 설정**
   - `version` (→ `runtimeVersion` 이 바뀐다), `plugins`, `android.package`,
     권한, 아이콘·스플래시, `scheme`(딥링크)
3. **Expo SDK 버전** 올리기
4. `android/` · `ios/` 직접 수정 (이 프로젝트는 CNG 라 그 폴더가 없다)

### 반대로 OTA(`eas update`)로 나가는 것

화면·컴포넌트, 로직·상태, API 호출, 문구·색·여백, SVG 아이콘, 이미지·폰트 에셋.
**대부분의 작업이 여기 해당한다.**

> **기준 한 줄**
> `package.json` 에 넣은 새 패키지가 `android/`·`ios/` 코드를 들고 오면 → 새 APK.
> 그 외 → `eas update`.

헷갈리면 `eas update` 를 먼저 돌려도 된다. 네이티브가 필요한 변경이면 앱에서
반영이 안 되거나 오류가 날 뿐, 되돌릴 수 없는 일은 아니다.

## 명령어

```bash
# 백엔드 (fam-daily-backend)
git push origin dev && git checkout main && git merge --ff-only dev && git push origin main
# → Railway 가 자동 배포. 마이그레이션은 앱 기동 시 자동 실행(migrationsRun: true)

# 웹
gh pr create --base main --head <브랜치> && gh pr merge <번호> --merge
# → Vercel 이 자동 배포

# 앱 (JS 변경)
npx eas-cli update --branch preview --message "무엇을 바꿨는지"
# → 서버 주소는 .env.production 에서 읽는다 (eas.json 의 build.env 는 APK 빌드에만 쓰인다).
#   서버 주소를 바꾼 직후엔 --clear-cache 를 붙인다 — 안 붙이면 예전 주소가 캐시에서 그대로 나간다.

# 앱 (네이티브 변경)
npx eas-cli build -p android --profile preview
# → 끝나면 나오는 링크를 가족들에게 공유
```

## 배포 순서

**백엔드 → 웹 → 앱** 순서를 지킨다.

앱·웹이 새 API 를 부르는데 서버에 그게 없으면 기능이 조용히 실패한다.
반대 순서는 안전하다 — 서버에 새 엔드포인트가 있어도 아무도 안 부르면 그만이다.

## ⚠️ `version` 을 함부로 올리지 말 것

`app.json` 의 `runtimeVersion` 이 `{ "policy": "appVersion" }` 이라
**`version` 을 올리면 `runtimeVersion` 이 따라 바뀐다.**

```
설치된 APK   runtimeVersion 1.0.3
새 업데이트   runtimeVersion 1.0.4   →  짝이 안 맞아 전달되지 않는다
```

즉 **기존 설치본이 그 순간부터 업데이트를 못 받는다.**
네이티브가 바뀌어 새 APK 를 배포할 때만 올린다.

## OTA 가 사용자에게 닿는 시점

`updates` 가 기본 설정이라 이렇게 동작한다.

```
1회차 실행 : 기존 화면으로 바로 열리고, 뒤에서 조용히 새 번들을 받는다
2회차 실행 : 새 화면이 적용된다
```

**앱을 한 번 껐다 켜야 보인다.** 즉시 반영은 아니다 — 켤 때마다 네트워크를
기다리면 시작이 느려지므로 Expo 의 기본값이 이렇다.

## 배포 확인

```bash
# 백엔드 — 상태와 커밋
railway status
curl -s -o /dev/null -w "%{http_code}\n" https://web-production-cb610.up.railway.app/api/health

# 웹 — 번들 해시가 바뀌었으면 새로 배포된 것
curl -s https://woorikkiri-jade.vercel.app | grep -oE "index-[a-f0-9]+\.js"

# 앱 — 발행된 업데이트 목록
npx eas-cli update:list --branch preview

# 앱 — 방금 만든 번들에 운영 서버 주소가 들어갔는지 (비어 있으면 localhost 로 붙는 업데이트다)
strings dist/_expo/static/js/android/*.hbc | grep -o "https://web-production-cb610[^ ]*"

# 앱 — 업데이트를 실제로 받아 실행한 기기 수
npx eas-cli update:insights <Update group ID> --platform android
```

웹 번들에서 한글 문구를 찾는 방식은 **통하지 않는다** (번들에 인코딩돼 들어간다).
해시 비교나 `last-modified` 헤더를 본다.
