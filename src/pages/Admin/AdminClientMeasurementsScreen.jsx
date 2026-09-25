import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import PressableScale from "../../components/PressableScale";
import useClientMeasurements from "../../hooks/useClientMeasurements";
import { useCheckInPhotos } from "../../hooks/useCheckIn";
import { photoUri } from "../../utils/photoCapture";
import {
  formatDateLong,
  formatDateShort,
} from "../../../backend/utils/appointmentConfig";
import {
  MEASUREMENT_FIELDS,
  PHOTO_ANGLES,
  comparisonPair,
} from "../../../backend/utils/progress";

const ACCENT = "#7C3AED";
const filled = (entry) => MEASUREMENT_FIELDS.filter((f) => entry[f.key]);
const angleCount = (entry) =>
  Array.isArray(entry.photoAngles) ? entry.photoAngles.length : 0;

/**
 * Read-only: the client enters her own measurements and photos (an online
 * client cannot be measured by the trainer). Photos are fetched only for the
 * entry that is opened, never for the whole list.
 */
export default function AdminClientMeasurementsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName } = params ?? {};

  const { measurements, loading } = useClientMeasurements(userId);
  const [openDate, setOpenDate] = useState(null);
  const [viewer, setViewer] = useState(null); // { uri, caption }

  const latest = measurements[0];
  const earliest = measurements[measurements.length - 1];

  const comparableAngles = useMemo(
    () => PHOTO_ANGLES.filter((a) => comparisonPair(measurements, a.key)),
    [measurements],
  );
  const [compareAngle, setCompareAngle] = useState(null);
  const activeAngle =
    comparableAngles.find((a) => a.key === compareAngle) ?? comparableAngles[0];

  return (
    <SafeAreaView style={s.safeArea}>
      <ProfilePageComponent />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={s.back}>← Natrag</Text>
        </Pressable>
        <Text style={s.title}>{displayName}</Text>
        <Text style={s.subtitle}>Mjere i slike koje klijentica unosi</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={ACCENT}
            style={{ marginTop: 40 }}
          />
        ) : measurements.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📏</Text>
            <Text style={s.emptyTitle}>Još nema unosa</Text>
            <Text style={s.emptyText}>
              Klijentica još nije unijela mjere ni slike.
            </Text>
          </View>
        ) : (
          <>
            <View style={s.startCard}>
              <View style={s.startItem}>
                <Text style={s.startLabel}>POČELA</Text>
                <Text style={s.startValue}>
                  {formatDateShort(earliest.date)}
                </Text>
              </View>
              <View style={s.startDivider} />
              <View style={s.startItem}>
                <Text style={s.startLabel}>UNOSA</Text>
                <Text style={s.startValue}>{measurements.length}</Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>NAJNOVIJE</Text>
            <View style={s.latestCard}>
              <Text style={s.latestDate}>{formatDateLong(latest.date)}</Text>
              {filled(latest).length > 0 && (
                <View style={s.tileGrid}>
                  {filled(latest).map((f) => (
                    <View key={f.key} style={s.tile}>
                      <Text style={s.tileLabel}>{f.label}</Text>
                      <Text style={s.tileValue}>
                        {latest[f.key]}
                        <Text style={s.tileUnit}> {f.unit}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {angleCount(latest) > 0 && (
                <CheckInPhotos
                  userId={userId}
                  date={latest.date}
                  onOpen={setViewer}
                />
              )}
            </View>

            {activeAngle && (
              <>
                <Text style={[s.sectionLabel, { marginTop: 22 }]}>
                  USPOREDBA
                </Text>
                <View style={s.angleRow}>
                  {comparableAngles.map((a) => (
                    <PressableScale
                      key={a.key}
                      style={[
                        s.angleChip,
                        a.key === activeAngle.key && s.angleChipActive,
                      ]}
                      onPress={() => setCompareAngle(a.key)}
                      accessibilityRole="tab"
                      accessibilityState={{
                        selected: a.key === activeAngle.key,
                      }}
                    >
                      <Text
                        style={[
                          s.angleChipText,
                          a.key === activeAngle.key && s.angleChipTextActive,
                        ]}
                      >
                        {a.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
                <Comparison
                  userId={userId}
                  pair={comparisonPair(measurements, activeAngle.key)}
                  angle={activeAngle}
                  onOpen={setViewer}
                />
              </>
            )}

            {measurements.length > 1 && (
              <>
                <Text style={[s.sectionLabel, { marginTop: 22 }]}>
                  POVIJEST
                </Text>
                {measurements.slice(1).map((entry) => {
                  const isOpen = openDate === entry.date;
                  const photos = angleCount(entry);
                  return (
                    <PressableScale
                      key={entry.id}
                      style={s.historyRow}
                      disabled={photos === 0}
                      onPress={() => setOpenDate(isOpen ? null : entry.date)}
                      accessibilityRole={photos ? "button" : undefined}
                      accessibilityState={{ expanded: isOpen }}
                    >
                      <View style={s.historyHead}>
                        <Text style={s.historyDate}>
                          {formatDateShort(entry.date)}
                        </Text>
                        {photos > 0 && (
                          <Text style={s.photoTag}>
                            📷 {photos} {isOpen ? "▴" : "▾"}
                          </Text>
                        )}
                      </View>
                      <View style={s.historyChips}>
                        {filled(entry).map((f) => (
                          <View key={f.key} style={s.chip}>
                            <Text style={s.chipText}>
                              {f.label} {entry[f.key]}
                            </Text>
                          </View>
                        ))}
                      </View>
                      {isOpen && (
                        <CheckInPhotos
                          userId={userId}
                          date={entry.date}
                          onOpen={setViewer}
                        />
                      )}
                    </PressableScale>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!viewer}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewer(null)}
      >
        <Pressable
          style={s.viewer}
          onPress={() => setViewer(null)}
          accessibilityRole="button"
          accessibilityLabel="Zatvori sliku"
        >
          {viewer && (
            <>
              <Image
                source={viewer.uri}
                style={s.viewerImage}
                contentFit="contain"
              />
              <Text style={s.viewerCaption}>{viewer.caption}</Text>
            </>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function CheckInPhotos({ userId, date, onOpen }) {
  const { photos, loading } = useCheckInPhotos(userId, date);
  if (loading) {
    return <ActivityIndicator color={ACCENT} style={{ marginTop: 14 }} />;
  }
  const present = PHOTO_ANGLES.filter((a) => photos[a.key]);
  if (!present.length) return null;
  return (
    <View style={s.thumbRow}>
      {present.map((a) => {
        const uri = photoUri(photos[a.key]);
        return (
          <Pressable
            key={a.key}
            style={s.thumbWrap}
            onPress={() =>
              onOpen({ uri, caption: `${a.label} · ${formatDateShort(date)}` })
            }
            accessibilityRole="button"
            accessibilityLabel={`${a.label}, povećaj`}
          >
            <View style={s.thumbFrame}>
              <Image source={uri} style={s.thumb} contentFit="cover" />
            </View>
            <Text style={s.thumbLabel}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Comparison({ userId, pair, angle, onOpen }) {
  const first = useCheckInPhotos(userId, pair?.first.date);
  const last = useCheckInPhotos(userId, pair?.last.date);
  if (!pair) return null;

  const side = (entry, state, label) => {
    const data = state.photos[angle.key];
    const uri = photoUri(data);
    return (
      <Pressable
        style={s.compareSide}
        disabled={!uri}
        onPress={() =>
          onOpen({
            uri,
            caption: `${angle.label} · ${formatDateShort(entry.date)}`,
          })
        }
      >
        <View style={s.compareFrame}>
          {state.loading ? (
            <ActivityIndicator color={ACCENT} />
          ) : uri ? (
            <Image source={uri} style={s.thumb} contentFit="cover" />
          ) : null}
        </View>
        <Text style={s.compareLabel}>{label}</Text>
        <Text style={s.compareDate}>{formatDateShort(entry.date)}</Text>
      </Pressable>
    );
  };

  return (
    <View style={s.compareRow}>
      {side(pair.first, first, "Prvi unos")}
      {side(pair.last, last, "Zadnji unos")}
    </View>
  );
}

const PAGE_BG = "#F7F7F8";

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  back: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: ACCENT,
    marginBottom: 10,
  },
  title: { fontSize: 22, fontFamily: "Outfit_700Bold", color: "#111827" },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginBottom: 12,
  },

  startCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    paddingVertical: 16,
    marginBottom: 22,
  },
  startItem: { flex: 1, alignItems: "center" },
  startDivider: { width: 1, backgroundColor: "#F0F0F2" },
  startLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  startValue: { fontSize: 17, fontFamily: "Outfit_700Bold", color: "#111827" },

  latestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  latestDate: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginBottom: 14,
  },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    minWidth: 92,
    flexGrow: 1,
    backgroundColor: "#F7F5FF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tileLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#8B7FB0",
    marginBottom: 4,
  },
  tileValue: { fontSize: 20, fontFamily: "Outfit_700Bold", color: ACCENT },
  tileUnit: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#A99FC7" },

  thumbRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  thumbWrap: { flex: 1 },
  thumbFrame: {
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#EEF0F3",
  },
  thumb: { width: "100%", height: "100%" },
  thumbLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },

  angleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  angleChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  angleChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  angleChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  angleChipTextActive: { color: "#FFFFFF" },
  compareRow: { flexDirection: "row", gap: 12 },
  compareSide: { flex: 1 },
  compareFrame: {
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#EEF0F3",
    alignItems: "center",
    justifyContent: "center",
  },
  compareLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginTop: 8,
  },
  compareDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  historyRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 14,
    marginBottom: 10,
  },
  historyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#111827" },
  photoTag: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: ACCENT },
  historyChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: "#F5F6F7",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#4B5563" },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },

  viewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  viewerImage: { width: "100%", height: "80%" },
  viewerCaption: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 14,
  },
});
