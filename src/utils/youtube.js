/**
 * YouTube thumbnail selection.
 *
 * Measured across the whole catalogue: maxresdefault averages 126 KB (1280×720),
 * sddefault 58 KB (640×480), hqdefault 14 KB. A card is 140 dp square, about
 * 385 px on a typical phone, so maxres was sending ~3× the pixels the card can
 * show — 4.2 MB for the 33-video abdominal category.
 *
 * sddefault covers the card at roughly 1:1, at under half the bytes. It is 4:3
 * with the 16:9 frame letterboxed, so it is drawn at LETTERBOX_CROP scale to
 * push the black bars outside the card. When a category zooms in further
 * (imageScale > 1), sd no longer has the pixels for it and maxres is used.
 */

export const LETTERBOX_CROP = 4 / 3;

const BASE = "https://i.ytimg.com/vi";

export function thumbnailFor(youtubeID, imageScale = 1) {
  if (!youtubeID) return null;
  const zoomed = imageScale > 1;
  return {
    uri: `${BASE}/${youtubeID}/${zoomed ? "maxresdefault" : "sddefault"}.jpg`,
    // maxres is already 16:9 with no bars; sd needs the crop.
    scale: zoomed ? imageScale : LETTERBOX_CROP,
  };
}

/** Full-width 16:9 hero, where maxres is worth its weight. */
export function heroFor(youtubeID) {
  return youtubeID ? `${BASE}/${youtubeID}/maxresdefault.jpg` : null;
}
