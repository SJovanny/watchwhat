import { useEffect, useState } from 'react'

/**
 * Hook pour gérer l'hydratation côté client
 * Retourne false côté serveur et true une fois hydraté côté client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
