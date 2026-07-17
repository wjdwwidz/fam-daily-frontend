import { useApp } from '../state/AppContext.jsx'
import { buildVm } from './buildVm.js'

// 화면/오버레이가 필요한 뷰모델을 스스로 가져가는 훅.
export function useVm() {
  return buildVm(useApp())
}
