import { createContext, useContext, type ReactNode, type RefObject } from 'react'
import type Lenis from 'lenis'
import { useLenis } from '../hooks/useLenis'

const LenisContext = createContext<RefObject<Lenis | null> | null>(null)

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useLenis()
  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  )
}

export function useLenisContext(): RefObject<Lenis | null> | null {
  return useContext(LenisContext)
}
