import useSWR, { mutate } from "swr"
import { fetchDocStatusMap } from "@/api"

/**
 * SWR‑powered hook that shares one status map across the app.
 * @param {number} refreshKey bump this to force a re‑fetch
 * @param {number} limit how many rows to request (default 1000)
 */
export const useDocStatusMap = (refreshKey = 0, limit = 1000) => {
  const key = ["doc‑status‑map", limit, refreshKey]
  const { data, error, isLoading } = useSWR(key, () => fetchDocStatusMap(limit))

  return {
    statusMap: data || {},
    loading: isLoading,
    error,
    /** revalidate immediately */
    refresh: () => mutate(key),
  }
}
