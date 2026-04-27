import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ─── Haptics ──────────────────────────────────────────────────────────────
let HapticsPlugin: any = null
async function getHaptics() {
  if (HapticsPlugin) return HapticsPlugin
  try {
    const { Haptics } = await import('@capacitor/haptics')
    HapticsPlugin = Haptics
    return Haptics
  } catch { return null }
}

export async function hapticLight() {
  const h = await getHaptics()
  h?.impact({ style: 'LIGHT' }).catch(() => {})
}

export async function hapticMedium() {
  const h = await getHaptics()
  h?.impact({ style: 'MEDIUM' }).catch(() => {})
}

export async function hapticSuccess() {
  const h = await getHaptics()
  h?.notification({ type: 'SUCCESS' }).catch(() => {})
}

export async function hapticError() {
  const h = await getHaptics()
  h?.notification({ type: 'ERROR' }).catch(() => {})
}

// ─── Android back button handler ─────────────────────────────────────────
export function useAndroidBack() {
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    let AppPlugin: any = null

    async function setup() {
      try {
        const { App } = await import('@capacitor/app')
        AppPlugin = App
        const handle = await App.addListener('backButton', ({ canGoBack }) => {
          if (location.pathname === '/') {
            // На главной — свернуть приложение
            App.minimizeApp()
          } else {
            navigate(-1)
          }
        })
        return () => handle.remove()
      } catch { return () => {} }
    }

    let cleanup = () => {}
    setup().then(fn => { cleanup = fn })
    return () => cleanup()
  }, [location.pathname, navigate])
}

// ─── Status bar setup ────────────────────────────────────────────────────
export async function setupNative() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#09090f' })
  } catch {}

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch {}
}
