import { useMemo, useSyncExternalStore } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * The exercise video catalogue, live from Firestore — shared by every screen.
 *
 * Each screen used to open its own listener, so stepping back into a category
 * started from an empty list and a spinner every time. The catalogue is one
 * small collection that the whole session reads, so it is loaded once, kept
 * warm, and every screen reads the same snapshot synchronously after that.
 *
 * Document id is the exercise id that saved workout programs reference, so it
 * must stay stable — see scripts/seed-videos.mjs.
 */

const EMPTY = { videos: [], loading: true, error: null };

let state = EMPTY;
let stopListening = null;
const listeners = new Set();

function emit(next) {
  state = next;
  listeners.forEach((l) => l());
}

function startListening() {
  if (stopListening) return;
  const q = query(collection(db, "videos"), orderBy("order"));
  stopListening = onSnapshot(
    q,
    (snapshot) => {
      emit({
        videos: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
        loading: false,
        error: null,
      });
    },
    (error) => {
      console.error("Error loading videos:", error);
      // A dead listener must not stay cached as "running", or the next screen
      // would wait forever for data that is never coming.
      stopListening = null;
      emit({ ...state, loading: false, error });
    },
  );
}

function subscribe(listener) {
  listeners.add(listener);
  startListening();
  // The listener is kept alive after the last screen unmounts on purpose —
  // keeping the catalogue warm is the point. resetVideoStore() ends it.
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

/** Ends the shared listener and forgets the catalogue (sign-out, tests). */
export function resetVideoStore() {
  if (stopListening) stopListening();
  stopListening = null;
  state = EMPTY;
  listeners.forEach((l) => l());
}

export default function useVideos() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Categories in the order they first appear, so the grid keeps the
  // catalogue's own ordering rather than an alphabetical one.
  const categories = useMemo(
    () => [...new Set(snapshot.videos.map((v) => v.category))],
    [snapshot.videos],
  );

  const byId = useMemo(
    () => new Map(snapshot.videos.map((v) => [String(v.id), v])),
    [snapshot.videos],
  );

  return { ...snapshot, categories, byId };
}
