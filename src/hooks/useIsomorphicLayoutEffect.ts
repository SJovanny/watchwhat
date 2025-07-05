import { useEffect, useLayoutEffect } from 'react'

// Utilise useLayoutEffect côté client et useEffect côté serveur
// pour éviter les erreurs d'hydratation
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
