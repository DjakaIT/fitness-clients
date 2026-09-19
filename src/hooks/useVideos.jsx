import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * The exercise video catalogue, live from Firestore.
 *
 * It used to be a source file, which meant the trainer could not add a video
 * without a developer, a rebuild and a store release. Keeping it in Firestore
 * also keeps the (often unlisted) YouTube ids out of the repository.
 *
 * Document id is the exercise id that saved workout programs reference, so it
 * must stay stable — see scripts/seed-videos.mjs.
 */
export default function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("order"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVideos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading videos:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  // Categories in the order they first appear, so the grid keeps the
  // catalogue's own ordering rather than an alphabetical one.
  const categories = useMemo(
    () => [...new Set(videos.map((v) => v.category))],
    [videos],
  );

  return { videos, categories, loading, error };
}
