import { Platform, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AppProvider } from './src/state/AppContext.jsx'
import FamilyPhonePop from './src/FamilyPhonePop'

let initialScreen = 'login'
let variant = 'grid'
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const p = new URLSearchParams(window.location.search)
  initialScreen = p.get('screen') || 'login'
  variant = p.get('variant') || 'grid'
}

// 폰에서 쓰는 앱이라 넓은 화면(노트북 브라우저)에서는 폰 너비로 가운데에 세운다.
// 폰 브라우저는 화면이 이보다 좁으니 그대로 꽉 찬다.
const isWeb = Platform.OS === 'web'
const PHONE_WIDTH = 430

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isWeb ? '#F6EAF1' : '#FFF6FB',
          alignItems: isWeb ? 'center' : undefined,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#FFF6FB',
            overflow: 'hidden',
            ...(isWeb
              ? {
                  maxWidth: PHONE_WIDTH,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: '#F0DCE6',
                }
              : null),
          }}
        >
          <AppProvider initialScreen={initialScreen} variant={variant}>
            <FamilyPhonePop />
          </AppProvider>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
