import {
  MAX_PHOTO_BASE64_LENGTH,
  PHOTO_ANGLES,
  PHOTO_ANGLE_KEYS,
  PHOTO_MAX_EDGE,
  buildMeasurementDoc,
  comparisonPair,
  diffPhotos,
  fitWithin,
  fitsInDocument,
  hasAnyMeasurement,
  isJpegBase64,
  isPhotoAngle,
  measurementDocId,
  photoDocId,
} from "../backend/utils/progress";

const mockManipulate = jest.fn();
const mockLaunchCamera = jest.fn();
const mockLaunchLibrary = jest.fn();
const mockCameraPerm = jest.fn();

jest.mock("expo-image-manipulator", () => ({
  SaveFormat: { JPEG: "jpeg" },
  ImageManipulator: { manipulate: (...a) => mockManipulate(...a) },
}));
jest.mock("expo-image-picker", () => ({
  launchCameraAsync: (...a) => mockLaunchCamera(...a),
  launchImageLibraryAsync: (...a) => mockLaunchLibrary(...a),
  requestCameraPermissionsAsync: (...a) => mockCameraPerm(...a),
}));

const {
  capturePhoto,
  encodeForStorage,
  photoUri,
} = require("../src/utils/photoCapture");

describe("photo angles", () => {
  it("offers exactly the four guided positions", () => {
    expect(PHOTO_ANGLE_KEYS).toEqual(["front", "back", "left", "right"]);
  });

  it("gives every position a label and a pose hint", () => {
    for (const a of PHOTO_ANGLES) {
      expect(a.label.length).toBeGreaterThan(0);
      expect(a.hint.length).toBeGreaterThan(10);
    }
  });

  it("recognises only those four", () => {
    expect(isPhotoAngle("front")).toBe(true);
    expect(isPhotoAngle("top")).toBe(false);
    expect(isPhotoAngle(undefined)).toBe(false);
  });
});

describe("document ids", () => {
  // The rules rebuild these exact strings; a mismatch would refuse every save.
  it("pins a check-in to owner and date", () => {
    expect(measurementDocId("u1", "2026-09-25")).toBe("u1_2026-09-25");
  });

  it("pins a photo to owner, date and angle", () => {
    expect(photoDocId("u1", "2026-09-25", "left")).toBe("u1_2026-09-25_left");
  });
});

describe("fitWithin", () => {
  it("scales a portrait photo by its height", () => {
    expect(fitWithin(3024, 4032)).toEqual({
      width: null,
      height: PHOTO_MAX_EDGE,
    });
  });

  it("scales a landscape photo by its width", () => {
    expect(fitWithin(4032, 3024)).toEqual({
      width: PHOTO_MAX_EDGE,
      height: null,
    });
  });

  it("never upscales a photo that is already small", () => {
    expect(fitWithin(800, 1000)).toBeNull();
    expect(fitWithin(PHOTO_MAX_EDGE, PHOTO_MAX_EDGE)).toBeNull();
  });

  it("does nothing with missing dimensions", () => {
    expect(fitWithin(undefined, 100)).toBeNull();
    expect(fitWithin(0, 0)).toBeNull();
  });
});

describe("payload checks", () => {
  it("recognises base64 JPEG by its start-of-image marker", () => {
    expect(isJpegBase64("/9j/4AAQSkZJRg")).toBe(true);
    expect(isJpegBase64("iVBORw0KGgo")).toBe(false); // PNG
    expect(isJpegBase64(null)).toBe(false);
  });

  it("enforces the per-document size cap", () => {
    expect(fitsInDocument("a".repeat(MAX_PHOTO_BASE64_LENGTH))).toBe(true);
    expect(fitsInDocument("a".repeat(MAX_PHOTO_BASE64_LENGTH + 1))).toBe(false);
  });

  it("keeps the cap safely below Firestore's 1 MiB document limit", () => {
    expect(MAX_PHOTO_BASE64_LENGTH).toBeLessThan(1024 * 1024 - 50_000);
  });
});

describe("buildMeasurementDoc", () => {
  it("normalises decimal commas and trims values", () => {
    const d = buildMeasurementDoc({
      userId: "u1",
      date: "2026-09-25",
      values: { weight: " 62,5 ", waist: "70" },
      photoAngles: [],
    });
    expect(d).toMatchObject({ weight: "62.5", waist: "70", hips: "" });
  });

  it("records which photos exist, in canonical order, ignoring junk", () => {
    const d = buildMeasurementDoc({
      userId: "u1",
      date: "2026-09-25",
      values: {},
      photoAngles: ["right", "front", "top"],
    });
    expect(d.photoAngles).toEqual(["front", "right"]);
  });

  it("knows whether anything was measured", () => {
    expect(hasAnyMeasurement({ weight: "" })).toBe(false);
    expect(hasAnyMeasurement({ hips: "90" })).toBe(true);
    expect(hasAnyMeasurement(undefined)).toBe(false);
  });
});

describe("diffPhotos", () => {
  it("writes only new or replaced photos, leaving untouched ones alone", () => {
    expect(
      diffPhotos(
        { front: "A", back: "B" },
        { front: "A", back: "B2", left: "C" },
      ),
    ).toEqual({ writes: ["back", "left"], deletes: [] });
  });

  it("deletes photos the client cleared", () => {
    expect(
      diffPhotos({ front: "A", back: "B" }, { front: "A", back: null }),
    ).toEqual({ writes: [], deletes: ["back"] });
  });

  it("does nothing when nothing changed", () => {
    expect(diffPhotos({ front: "A" }, { front: "A" })).toEqual({
      writes: [],
      deletes: [],
    });
  });
});

describe("comparisonPair", () => {
  const entries = [
    { date: "2026-09-25", photoAngles: ["front", "back"] },
    { date: "2026-06-01", photoAngles: ["front"] },
    { date: "2026-07-15", photoAngles: ["back"] },
  ];

  it("pairs the earliest and latest check-ins that have that angle", () => {
    expect(comparisonPair(entries, "front")).toEqual({
      first: entries[1],
      last: entries[0],
    });
  });

  it("needs two photos of the same angle to compare", () => {
    expect(comparisonPair(entries, "left")).toBeNull();
    expect(comparisonPair([entries[0]], "front")).toBeNull();
    expect(comparisonPair(undefined, "front")).toBeNull();
  });
});

describe("encodeForStorage", () => {
  const fakeContext = (saves) => {
    const resize = jest.fn();
    const image = {
      saveAsync: jest
        .fn()
        .mockImplementation(() => Promise.resolve(saves.shift())),
    };
    mockManipulate.mockReturnValue({
      resize,
      renderAsync: jest.fn().mockResolvedValue(image),
    });
    return { resize, image };
  };

  beforeEach(() => jest.clearAllMocks());

  it("resizes a full-size photo and re-encodes it as JPEG", async () => {
    const { resize, image } = fakeContext([
      { base64: "/9j/ok", width: 1080, height: 1440 },
    ]);
    const out = await encodeForStorage({
      uri: "file://x",
      width: 3024,
      height: 4032,
    });
    expect(resize).toHaveBeenCalledWith({
      width: null,
      height: PHOTO_MAX_EDGE,
    });
    expect(image.saveAsync).toHaveBeenCalledWith(
      expect.objectContaining({ format: "jpeg", base64: true }),
    );
    expect(out).toEqual({ base64: "/9j/ok", width: 1080, height: 1440 });
  });

  it("steps the quality down until the photo fits", async () => {
    const { image } = fakeContext([
      { base64: "/9j/" + "a".repeat(MAX_PHOTO_BASE64_LENGTH) },
      { base64: "/9j/small" },
    ]);
    const out = await encodeForStorage({
      uri: "file://x",
      width: 1000,
      height: 1000,
    });
    expect(image.saveAsync).toHaveBeenCalledTimes(2);
    expect(out.base64).toBe("/9j/small");
  });

  it("gives up with a message rather than storing an oversized photo", async () => {
    const big = "/9j/" + "a".repeat(MAX_PHOTO_BASE64_LENGTH);
    fakeContext([{ base64: big }, { base64: big }, { base64: big }]);
    const out = await encodeForStorage({
      uri: "file://x",
      width: 10,
      height: 10,
    });
    expect(out.error).toBeTruthy();
  });
});

describe("capturePhoto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManipulate.mockReturnValue({
      resize: jest.fn(),
      renderAsync: jest.fn().mockResolvedValue({
        saveAsync: jest
          .fn()
          .mockResolvedValue({ base64: "/9j/x", width: 1, height: 1 }),
      }),
    });
  });

  // Location privacy: EXIF must never be requested from the picker, and the
  // image is always re-encoded, which drops what the camera wrote.
  it("never asks the picker for EXIF", async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://a", width: 10, height: 10 }],
    });
    await capturePhoto("library");
    expect(mockLaunchLibrary.mock.calls[0][0]).toMatchObject({
      exif: false,
      mediaTypes: ["images"],
    });
    expect(mockManipulate).toHaveBeenCalled();
  });

  it("asks for camera permission and explains a refusal", async () => {
    mockCameraPerm.mockResolvedValue({ granted: false });
    const out = await capturePhoto("camera");
    expect(mockLaunchCamera).not.toHaveBeenCalled();
    expect(out.error).toMatch(/kamer/);
  });

  it("treats backing out of the picker as a quiet cancel", async () => {
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: null });
    expect(await capturePhoto("library")).toEqual({ cancelled: true });
  });

  it("reports a failure instead of throwing into the screen", async () => {
    mockLaunchLibrary.mockRejectedValue(new Error("boom"));
    const out = await capturePhoto("library");
    expect(out.error).toBeTruthy();
  });

  it("builds a data URI for display", () => {
    expect(photoUri("/9j/x")).toBe("data:image/jpeg;base64,/9j/x");
    expect(photoUri(null)).toBeNull();
  });
});
