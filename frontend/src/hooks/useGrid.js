import { useQuery } from '@tanstack/react-query'
import { fetchGrid } from '../api/client'
import useGridStore from '../store/gridStore'
import { useEffect } from 'react'

/**
 * useGrid — fetches GET /api/grid on mount, populates the Zustand store.
 * Returns React Query state so consumers can show loading/error UI.
 */
export function useGrid() {
  const setGrid = useGridStore((s) => s.setGrid)

  const query = useQuery({
    queryKey: ['grid'],
    queryFn: fetchGrid,
    staleTime: Infinity,   // grid is live-updated by STOMP; don't re-fetch
    retry: 3,
  })

  useEffect(() => {
    if (query.data?.grid) {
      setGrid(query.data.grid)
    }
  }, [query.data, setGrid])

  return query
}
