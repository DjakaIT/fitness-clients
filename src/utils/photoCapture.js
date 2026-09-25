import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import {
  PHOTO_QUALITIES,
  fitWithin,
  fitsInDocument,
  isJpegBase64,
} from "../../backend/utils/progress";

/**
 * Takes or picks a progress photo and turns it into something safe to store.
 *
 * The image is always re-encoded, never passed through. That does two jobs:
 * it brings a 4–12 MB camera photo down to a few hundred KB, and it drops the
 * original EXIF block — which on a phone photo usually includes the GPS
 * coordinates of where it was taken. A body photo taken at home should not
 * carry the client's home address.
 *
 * Returns { base64, width, height }, { cancelled: true } or { error }.
 */
export async function capturePhoto(source) {
  try {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        return {
          error:
            "Bez dopuštenja za kameru ne mogu uslikati. Dopusti ga u postavkama ili odaberi sliku iz galerije.",
        };
      }
    }

    const options = {
      mediaTypes: ["images"],
      quality: 1,
      exif: false,
      base64: false,
      allowsEditing: false,
    };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.length) return { cancelled: true };
    return await encodeForStorage(result.assets[0]);
  } catch (error) {
    console.error("Photo capture failed:", error);
    return { error: "Slika se nije mogla učitati. Pokušaj ponovo." };
  }
}

/** Resize + re-encode, stepping quality down until it fits in a document. */
export async function encodeForStorage(asset) {
  const context = ImageManipulator.manipulate(asset.uri);
  const size = fitWithin(asset.width, asset.height);
  if (size) context.resize(size);
  const image = await context.renderAsync();

  for (const compress of PHOTO_QUALITIES) {
    const saved = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress,
      base64: true,
    });
    if (isJpegBase64(saved.base64) && fitsInDocument(saved.base64)) {
      return { base64: saved.base64, width: saved.width, height: saved.height };
    }
  }
  return {
    error: "Slika je prevelika i ne može se spremiti. Pokušaj s drugom slikom.",
  };
}

export const photoUri = (base64) =>
  base64 ? `data:image/jpeg;base64,${base64}` : null;
