import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) ?? 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, setTheme, toggleTheme }
}

/** Helper: returns all theme-aware colors */
export function useThemeColors() {
  const { theme } = useTheme()
  const d = theme === 'dark'
  return {
    isDark: d,
    bg: d ? '#141414' : '#f5f5f7',
    surface: d ? '#1c1c1c' : '#ffffff',
    surface2: d ? '#222222' : '#f0f0f2',
    border: d ? '#303030' : '#e2e2e5',
    text: d ? '#f5f5f5' : '#1a1a1a',
    textSub: d ? '#999' : '#666',
    textMuted: d ? '#555' : '#999',
    inputBg: d ? '#141414' : '#f5f5f7',
    sidebar: d ? '#111111' : '#ffffff',
  }
}
