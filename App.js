import { Platform } from 'react-native'
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

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF6FB' }}>
        <StatusBar style="dark" />
        <AppProvider initialScreen={initialScreen} variant={variant}>
          <FamilyPhonePop />
        </AppProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
