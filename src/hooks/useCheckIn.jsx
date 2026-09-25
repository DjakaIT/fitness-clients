import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import {
  buildMeasurementDoc,
  diffPhotos,
  measurementDocId,
  photoDocId,
} from "../../backend/utils/progress";

/**
 * The photos of one check-in, loaded on demand. Lists never load photos —
 * they read `photoAngles` off the measurement document — so a history of
 * twenty check-ins does not download eighty images.
 *
 * Returns { photos: { front: base64, ... }, loading, error }.
 */
export function useCheckInPhotos(userId, date) {
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(Boolean(userId && date));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!userId || !date) {
      setPhotos({});
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    // A query, not four getDoc calls: reading a photo that does not exist
    // would be refused by the rules (they check the stored owner), whereas a
    // query simply returns fewer documents.
    getDocs(
      query(
        collection(db, "progress_photos"),
        where("userId", "==", userId),
        where("date", "==", date),
      ),
    )
      .then((snap) => {
        if (!active) return;
        const next = {};
        snap.docs.forEach((d) => {
          const { angle, data } = d.data();
          if (angle && data) next[angle] = data;
        });
        setPhotos(next);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading check-in photos:", err);
        if (active) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [userId, date]);

  return { photos, loading, error };
}

/**
 * Saves a check-in atomically: the measurement document, new photos, and the
 * removal of photos the client cleared. All or nothing — a half-saved
 * check-in would list photos that are not there.
 */
export function useSaveCheckIn() {
  const [isSaving, setIsSaving] = useState(false);

  const saveCheckIn = useCallback(
    async ({ userId, date, values, photosBefore = {}, photosAfter = {} }) => {
      if (!userId || !date) return { success: false };
      setIsSaving(true);
      try {
        const { writes, deletes } = diffPhotos(photosBefore, photosAfter);
        const batch = writeBatch(db);

        batch.set(doc(db, "measurements", measurementDocId(userId, date)), {
          ...buildMeasurementDoc({
            userId,
            date,
            values,
            photoAngles: Object.keys(photosAfter).filter((k) => photosAfter[k]),
          }),
          updatedAt: serverTimestamp(),
        });

        for (const angle of writes) {
          batch.set(
            doc(db, "progress_photos", photoDocId(userId, date, angle)),
            {
              userId,
              date,
              angle,
              mimeType: "image/jpeg",
              data: photosAfter[angle],
              createdAt: serverTimestamp(),
            },
          );
        }
        for (const angle of deletes) {
          batch.delete(
            doc(db, "progress_photos", photoDocId(userId, date, angle)),
          );
        }

        await batch.commit();
        return {
          success: true,
          written: writes.length,
          deleted: deletes.length,
        };
      } catch (error) {
        console.error("Error saving check-in:", error);
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return { saveCheckIn, isSaving };
}
