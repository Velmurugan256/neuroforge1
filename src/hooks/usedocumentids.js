import { useEffect, useState } from "react";

/**
 * Fetches document IDs from the status tracker.
 *
 * @param {string|string[]} status  Single status ("uploaded") or array ["uploaded","retry"].
 * @param {Array}           deps    Extra dependencies that should trigger a refetch
 *                                  (e.g. a refresh counter from parent).
 *
 * @returns {{ docs: string[], loading: boolean }}
 */
export function useDocumentIds(status = "learned", deps = []) {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;                 // avoid state set after unmount

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://a4pifj82cl.execute-api.us-east-1.amazonaws.com/prod/status/list?limit=500"
        );
        const rows = await res.json();

        // Uncomment next line to debug raw rows
        // console.log("📦 All status entries:", rows);

        const wanted = Array.isArray(status) ? status : [status];

        const filtered = rows
          .filter((row) => wanted.includes(row.status))
          .map((row) => row.document_id);

        if (alive) setDocs(filtered);
      } catch (err) {
        console.error("❌ Doc-ID fetch failed:", err);
        if (alive) setDocs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [status, ...deps]);   // ← re-run when status OR any dep changes

  return { docs, loading };
}
