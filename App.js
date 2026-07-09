import { SafeAreaView, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF6FB' }}>
      <StatusBar style="dark" />
      <FamilyPhonePop variant={variant} initialScreen={initialScreen} />
    </SafeAreaView>
  )
}
