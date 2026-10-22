import type { CSSProperties } from 'react'
import type { UnlockAnimation } from '../config/theme'

// lockExit: 해제 시 잠금화면이 도달하는 상태 / homeHidden: 잠겨 있는 동안 홈 화면의 대기 상태
export const unlockTransitions: Record<UnlockAnimation, { lockExit: CSSProperties; homeHidden: CSSProperties }> = {
  slideUp: {
    lockExit: { transform: 'translateY(-100%)' },
    homeHidden: { transform: 'scale(1.08)', opacity: 0.4 },
  },
  fade: {
    lockExit: { opacity: 0 },
    homeHidden: { opacity: 0 },
  },
  zoom: {
    lockExit: { transform: 'scale(1.2)', opacity: 0 },
    homeHidden: { transform: 'scale(0.85)', opacity: 0 },
  },
}
