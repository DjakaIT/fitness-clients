import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import useClientMeasurements from "../../hooks/useClientMeasurements";
import useSaveMeasurement from "../../hooks/useSaveMeasurement";
import {
  toLocalDateString,
  formatDateLong,
  formatDateShort,
} from "../../../backend/utils/appointmentConfig";

const FIELDS = [
  { key: "weight", label: "Kilaža", unit: "kg" },
  { key: "waist", label: "Struk", unit: "cm" },
  { key: "hips", label: "Bokovi", unit: "cm" },
  { key: "chest", label: "Grudi", unit: "cm" },
  { key: "arms", label: "Ruke", unit: "cm" },
];

const EMPTY_INPUTS = { weight: "", waist: "", hips: "", chest: "", arms: "" };

const shiftDate = (dateStr, delta) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toLocalDateString(dt);
};

export default function AdminClientMeasurementsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName } = params ?? {};

  const { measurements, loading } = useClientMeasurements(userId);
  const { saveMeasurement, isSaving } = useSaveMeasurement();

  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState(() => toLocalDateString());
  const [inputs, setInputs] = useState(EMPTY_INPUTS);

  const today = toLocalDateString();
  const latest = measurements[0];
  const earliest = measurements[measurements.length - 1];
  const history = measurements.slice(1);

  const hasAnyValue = useMemo(
    () => FIELDS.some((f) => inputs[f.key].trim() !== ""),
    [inputs],
  );

  const openForm = () => {
    setDate(today);
    setInputs(EMPTY_INPUTS);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!hasAnyValue) return;
    const res = await saveMeasurement({ userId, date, ...inputs });
    if (res.success) setFormOpen(false);
  };

  const setField = (key, value) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const filledFields = (entry) => FIELDS.filter((f) => entry[f.key]);

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
        <Text style={s.subtitle}>Mjerenja i napredak</Text>

        <GeneralButton
          colors={["#7C3AED", "#6D28D9"]}
          fullWidth
          onPress={openForm}
          style={{ marginBottom: 20 }}
        >
          + Dodaj mjerenja
        </GeneralButton>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={{ marginTop: 40 }}
          />
        ) : measurements.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📏</Text>
            <Text style={s.emptyTitle}>Još nema mjerenja</Text>
            <Text style={s.emptyText}>
              Dodaj prvo mjerenje da pratiš napredak.
            </Text>
          </View>
        ) : (
          <>
            {/* Start summary */}
            <View style={s.startCard}>
              <View style={s.startItem}>
                <Text style={s.startLabel}>POČELA</Text>
                <Text style={s.startValue}>
                  {formatDateShort(earliest.date)}
                </Text>
              </View>
              <View style={s.startDivider} />
              <View style={s.startItem}>
                <Text style={s.startLabel}>MJERENJA</Text>
                <Text style={s.startValue}>{measurements.length}</Text>
              </View>
            </View>

            {/* Latest */}
            <Text style={s.sectionLabel}>NAJNOVIJE</Text>
            <View style={s.latestCard}>
              <Text style={s.latestDate}>{formatDateLong(latest.date)}</Text>
              <View style={s.tileGrid}>
                {filledFields(latest).map((f) => (
                  <View key={f.key} style={s.tile}>
                    <Text style={s.tileLabel}>{f.label}</Text>
                    <Text style={s.tileValue}>
                      {latest[f.key]}
                      <Text style={s.tileUnit}> {f.unit}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* History */}
            {history.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { marginTop: 22 }]}>POVIJEST</Text>
                {history.map((entry) => (
                  <View key={entry.id} style={s.historyRow}>
                    <Text style={s.historyDate}>
                      {formatDateShort(entry.date)}
                    </Text>
                    <View style={s.historyChips}>
                      {filledFields(entry).map((f) => (
                        <View key={f.key} style={s.chip}>
                          <Text style={s.chipText}>
                            {f.label} {entry[f.key]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Add measurement form */}
      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFormOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.modalOverlay}
        >
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Nova mjerenja</Text>

            {/* Date stepper */}
            <View style={s.dateRow}>
              <Pressable
                style={s.dateArrow}
                onPress={() => setDate((d) => shiftDate(d, -1))}
                hitSlop={8}
              >
                <Text style={s.dateArrowText}>‹</Text>
              </Pressable>
              <Text style={s.dateText}>{formatDateLong(date)}</Text>
              <Pressable
                style={[s.dateArrow, date >= today && s.dateArrowDisabled]}
                disabled={date >= today}
                onPress={() => setDate((d) => shiftDate(d, 1))}
                hitSlop={8}
              >
                <Text
                  style={[
                    s.dateArrowText,
                    date >= today && s.dateArrowTextDisabled,
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            </View>

            {/* Fields */}
            <View style={s.fieldGrid}>
              {FIELDS.map((f) => (
                <View key={f.key} style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>
                    {f.label} <Text style={s.fieldUnit}>({f.unit})</Text>
                  </Text>
                  <TextInput
                    style={s.fieldInput}
                    value={inputs[f.key]}
                    onChangeText={(v) => setField(f.key, v)}
                    keyboardType="decimal-pad"
                    placeholder="–"
                    placeholderTextColor="#C7CBD1"
                  />
                </View>
              ))}
            </View>

            <View style={s.modalBtns}>
              <Pressable
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => setFormOpen(false)}
                disabled={isSaving}
              >
                <Text style={s.modalBtnCancelText}>Odustani</Text>
              </Pressable>
              <Pressable
                style={[
                  s.modalBtn,
                  s.modalBtnConfirm,
                  (!hasAnyValue || isSaving) && s.modalBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!hasAnyValue || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.modalBtnConfirmText}>Spremi</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const PAGE_BG = "#F7F7F8";

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  back: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
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

  // Start summary
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
  startValue: {
    fontSize: 17,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
  },

  // Latest
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
  tileValue: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#7C3AED",
  },
  tileUnit: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#A99FC7",
  },

  // History
  historyRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 14,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  historyChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: "#F5F6F7",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#4B5563",
  },

  // Empty
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 6,
    marginBottom: 18,
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  dateArrowDisabled: { backgroundColor: "#F3F4F6" },
  dateArrowText: {
    fontSize: 22,
    color: "#7C3AED",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
  },
  dateArrowTextDisabled: { color: "#C7CBD1" },
  dateText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  fieldGroup: { width: "47%", flexGrow: 1 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 6,
  },
  fieldUnit: { fontFamily: "Inter_400Regular", color: "#9CA3AF" },
  fieldInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    textAlign: "center",
  },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: { backgroundColor: "#F3F4F6" },
  modalBtnCancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
  },
  modalBtnConfirm: { backgroundColor: "#7C3AED" },
  modalBtnConfirmText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  modalBtnDisabled: { opacity: 0.5 },
});
